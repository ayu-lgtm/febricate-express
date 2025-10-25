const {
  ProductionOrder,
  ApprovalWorkflow,
  Role,
  CodeMaster,
  sequelize,
  User
} = require('../models');
const { Op } = require('sequelize');

/** ─────────────────────────────
 * Build status map
 * ───────────────────────────── */
async function getOrderStatusMap(tx) {
  const codes = await CodeMaster.findAll({
    where: {
      CODE_MASTER_CATEGORY: 'ORDER_STATUS',
      CODE_MASTER_IS_ACTIVE: true
    },
    transaction: tx
  });
  return codes.reduce((m, c) => {
    m[c.CODE_MASTER_KEY] = c.CODE_MASTER_VALUE;
    return m;
  }, {});
}

/** ─────────────────────────────
 * Archive old WF and insert new
 * ───────────────────────────── */
async function archiveAndInsert({
  tx,
  wf,
  orderId,
  roleId,
  newStatus,
  newLevel,
  remarks,
  userId,
  active = true
}) {
  if (wf) {
    await wf.update(
      {
        APPROVAL_WORKFLOW_IS_ACTIVE: false,
        APPROVAL_WORKFLOW_MODIFIED_BY: userId,
        APPROVAL_WORKFLOW_MODIFIED_ON: new Date()
      },
      { transaction: tx }
    );
  }
  return ApprovalWorkflow.create(
    {
      APPROVAL_WORKFLOW_ORDER_ID: orderId,
      APPROVAL_WORKFLOW_ROLE_ID: wf ? wf.APPROVAL_WORKFLOW_ROLE_ID : roleId,
      APPROVAL_WORKFLOW_APPROVAL_LEVEL:
        newLevel ?? wf.APPROVAL_WORKFLOW_APPROVAL_LEVEL,
      APPROVAL_WORKFLOW_STATUS: newStatus,
      APPROVAL_WORKFLOW_REMARKS: remarks || null,
      APPROVAL_WORKFLOW_ACTION_DATE: new Date(),
      APPROVAL_WORKFLOW_CREATED_BY: userId,
      APPROVAL_WORKFLOW_CREATED_ON: new Date(),
      APPROVAL_WORKFLOW_IS_ACTIVE: active
    },
    { transaction: tx, individualHooks: true, userId }
  );
}

/** ─────────────────────────────
 * Get full order history
 * ───────────────────────────── */
async function getOrderHistory(orderId) {
  if (!orderId) throw new Error('orderId is required');
  const order = await ProductionOrder.findByPk(orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  
  const workflows = await ApprovalWorkflow.findAll({
    where: { APPROVAL_WORKFLOW_ORDER_ID: orderId },
    order: [
      ['APPROVAL_WORKFLOW_APPROVAL_LEVEL', 'ASC'],
      ['APPROVAL_WORKFLOW_CREATED_ON', 'ASC']
    ]
  });
  
  return {
    orderId: order.PRODUCTION_ORDER_ID,
    finalStatus: order.PRODUCTION_ORDER_FINAL_STATUS,
    currentLevel: order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL,
    isActive: order.PRODUCTION_ORDER_IS_ACTIVE,
    workflow: workflows.map(wf => ({
      level: wf.APPROVAL_WORKFLOW_APPROVAL_LEVEL,
      roleId: wf.APPROVAL_WORKFLOW_ROLE_ID,
      status: wf.APPROVAL_WORKFLOW_STATUS,
      isActive: wf.APPROVAL_WORKFLOW_IS_ACTIVE,
      remarks: wf.APPROVAL_WORKFLOW_REMARKS,
      actionDate: wf.APPROVAL_WORKFLOW_ACTION_DATE,
      // Add these missing fields:
      createdBy: wf.APPROVAL_WORKFLOW_CREATED_BY,
      modifiedBy: wf.APPROVAL_WORKFLOW_MODIFIED_BY,
      createdOn: wf.APPROVAL_WORKFLOW_CREATED_ON,
      modifiedOn: wf.APPROVAL_WORKFLOW_MODIFIED_ON
    }))
  };
}

/** ─────────────────────────────
 * Create initial WF rows
 * ───────────────────────────── */
async function createApprovalWorkflow(order, userId, externalTx = null) {
  const tx = externalTx || (await sequelize.transaction());
  try {
    const map = await getOrderStatusMap(tx);
    const roles = await Role.findAll({
      where: {
        ROLE_ROLE_NAME: ['sales', 'spc_manager', 'spc_production']
      },
      transaction: tx
    });
    const roleMap = roles.reduce((m, r) => {
      m[r.ROLE_ROLE_NAME] = r.ROLE_ID;
      return m;
    }, {});

    if (!order.PRODUCTION_ORDER_ID) {
      order.PRODUCTION_ORDER_CREATED_BY = userId;
      order.PRODUCTION_ORDER_CREATED_ON = new Date();
      await order.save({ transaction: tx, userId });
      await order.reload({ transaction: tx });
    }

    // initial chain
    const wfData = [
      { level: 1, role: 'spc_manager', active: true },
      { level: 2, role: 'spc_production', active: false }
    ];
    for (const w of wfData) {
      await ApprovalWorkflow.create(
        {
          APPROVAL_WORKFLOW_ORDER_ID: order.PRODUCTION_ORDER_ID,
          APPROVAL_WORKFLOW_ROLE_ID: roleMap[w.role],
          APPROVAL_WORKFLOW_APPROVAL_LEVEL: w.level,
          APPROVAL_WORKFLOW_STATUS: 'PENDING',
          APPROVAL_WORKFLOW_IS_ACTIVE: w.active
        },
        { transaction: tx, individualHooks: true, userId }
      );
    }

    order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = 1;
    order.PRODUCTION_ORDER_FINAL_STATUS = 'PENDING';
    order.PRODUCTION_ORDER_STATUS = map['PENDING_LEVEL_1'];
    order.PRODUCTION_ORDER_MODIFIED_BY = userId;
    order.PRODUCTION_ORDER_MODIFIED_ON = new Date();
    await order.save({ transaction: tx, userId });

    if (!externalTx) await tx.commit();
    return order.toJSON();
  } catch (e) {
    if (!externalTx) await tx.rollback();
    throw e;
  }
}

/** ─────────────────────────────
 * Handle approve / return / reject / resubmit actions
 * ───────────────────────────── */
async function handleApproval({
  orderId,
  roleId,
  action,
  remarks,
  targetLevel,
  adminOverride = false,
  userId
}) {

  if(roleId==1){
    adminOverride=true
  }

//   console.log('handleApproval targetLevel:', targetLevel);
  const tx = await sequelize.transaction();
  try {
    const map = await getOrderStatusMap(tx);
    const order = await ProductionOrder.findByPk(orderId, { transaction: tx });
    if (!order) throw new Error('Order not found');
    const act = action.toUpperCase();

    /** ───── ADMIN OVERRIDE ───── */
  
    if (adminOverride) {
      
      // Get all active pending WF rows
      const activeWFs = await ApprovalWorkflow.findAll({
        where: {
          APPROVAL_WORKFLOW_ORDER_ID: orderId,
          APPROVAL_WORKFLOW_IS_ACTIVE: true,
          APPROVAL_WORKFLOW_STATUS: 'PENDING'
        },
        transaction: tx
      });
      
      if (!activeWFs.length) throw new Error('No active workflow to process');
      
      if (act === 'RETURN') {
        // Admin can return to any level including sales
        for (const wf of activeWFs) {
          await archiveAndInsert({
            tx,
            wf,
            orderId,
            newStatus: 'RETURN',
            remarks,
            userId,
            active: false
          });
        }
        
        let backLevel = typeof targetLevel !== 'undefined' 
          ? targetLevel 
          : Math.min(...activeWFs.map(w => w.APPROVAL_WORKFLOW_APPROVAL_LEVEL)) - 1;
        
        if (backLevel >= 1) {
          // Activate the previous level workflow
          const prevWF = await ApprovalWorkflow.findOne({
            where: {
              APPROVAL_WORKFLOW_ORDER_ID: orderId,
              APPROVAL_WORKFLOW_APPROVAL_LEVEL: backLevel
            },
            transaction: tx
          });
          
          if (prevWF) {
            await prevWF.update(
              { 
                APPROVAL_WORKFLOW_IS_ACTIVE: true,
                APPROVAL_WORKFLOW_STATUS: 'PENDING'
              },
              { transaction: tx }
            );
          }
          
          order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = backLevel;
          order.PRODUCTION_ORDER_STATUS = 
            map[`PENDING_LEVEL_${backLevel}`] || map['PENDING'];
          order.PRODUCTION_ORDER_FINAL_STATUS = 'PENDING';
        } else {
          // Back to sales - create sales workflow if needed
          let salesWF = await ApprovalWorkflow.findOne({
            where: {
              APPROVAL_WORKFLOW_ORDER_ID: orderId,
              APPROVAL_WORKFLOW_APPROVAL_LEVEL: 0
            },
            transaction: tx
          });
          
          const salesRole = await Role.findOne({
            where: { ROLE_ROLE_NAME: 'sales' },
            transaction: tx
          });
          
         
          
          order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = 0;
          order.PRODUCTION_ORDER_STATUS =
          map['RETURN_LEVEL_0'] || map['RETURN_TO_SALES'] || 'Returned to Sales';
          order.PRODUCTION_ORDER_FINAL_STATUS = 'RETURN';
        }
      } 
      else if (act === 'APPROVE') {
        // Admin Approve - move to next level or final approval
        for (const wf of activeWFs) {
          await archiveAndInsert({
            tx,
            wf,
            orderId,
            newStatus: 'APPROVED',
            remarks,
            userId,
            active: false
          });
        }
        
        let maxLevel = Math.max(
          ...activeWFs.map(w => w.APPROVAL_WORKFLOW_APPROVAL_LEVEL)
        );
        
        // Check if there's a next level
        if (maxLevel < 2) {
          const nextLevel = maxLevel + 1;
          const nextWF = await ApprovalWorkflow.findOne({
            where: {
              APPROVAL_WORKFLOW_ORDER_ID: orderId,
              APPROVAL_WORKFLOW_APPROVAL_LEVEL: nextLevel
            },
            transaction: tx
          });
          
          if (nextWF) {
            await nextWF.update(
              { 
                APPROVAL_WORKFLOW_IS_ACTIVE: true,
                APPROVAL_WORKFLOW_STATUS: 'PENDING'
              },
              { transaction: tx }
            );
            
            order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = nextLevel;
            order.PRODUCTION_ORDER_STATUS = map[`PENDING_LEVEL_${nextLevel}`];
            order.PRODUCTION_ORDER_FINAL_STATUS = 'PENDING';
          } else {
            // Final approval if no next level
            order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = maxLevel;
            order.PRODUCTION_ORDER_STATUS = map['APPROVED'];
            order.PRODUCTION_ORDER_FINAL_STATUS = 'APPROVED';
          }
        } else {
          // Final approval for production level
          order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = maxLevel;
          order.PRODUCTION_ORDER_STATUS = map['APPROVED'];
          order.PRODUCTION_ORDER_FINAL_STATUS = 'APPROVED';
        }
      } 
      else if (act === 'REJECT') {
        // Admin Reject → order immediately becomes REJECTED
        for (const wf of activeWFs) {
          await archiveAndInsert({
            tx,
            wf,
            orderId,
            newStatus: 'REJECTED',
            remarks,
            userId,
            active: false
          });
        }
        
        order.PRODUCTION_ORDER_STATUS = map['REJECTED'];
        order.PRODUCTION_ORDER_FINAL_STATUS = 'REJECTED';
      } else {
        throw new Error(`Unknown admin action ${act}`);
      }
      
      order.PRODUCTION_ORDER_MODIFIED_BY = userId;
      order.PRODUCTION_ORDER_MODIFIED_ON = new Date();
      await order.save({ transaction: tx, userId });
      await tx.commit();
      return order.toJSON();
    }


    /** ───── Normal flow ───── */
    const currentWF = await ApprovalWorkflow.findOne({
      where: {
        APPROVAL_WORKFLOW_ORDER_ID: orderId,
        APPROVAL_WORKFLOW_ROLE_ID: roleId,
        APPROVAL_WORKFLOW_IS_ACTIVE: true,
        APPROVAL_WORKFLOW_STATUS: 'PENDING'
      },
      transaction: tx
    });
    if (!currentWF && act !== 'RESUBMIT')
      throw new Error('No pending workflow for this role');

    /** ───── APPROVE ───── */
    if (act === 'APPROVE') {
      await archiveAndInsert({
        tx,
        wf: currentWF,
        orderId,
        newStatus: 'APPROVED',
        remarks,
        userId,
        active:false
      });
      if (currentWF.APPROVAL_WORKFLOW_APPROVAL_LEVEL === 1) {
        // activate production level
        const nextWF = await ApprovalWorkflow.findOne({
          where: {
            APPROVAL_WORKFLOW_ORDER_ID: orderId,
            APPROVAL_WORKFLOW_APPROVAL_LEVEL: 2
          },
          transaction: tx
        });
        if (nextWF) {
          await nextWF.update(
            { APPROVAL_WORKFLOW_IS_ACTIVE: true },
            { transaction: tx }
          );
          order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = 2;
          order.PRODUCTION_ORDER_STATUS = map['PENDING_LEVEL_2'];
          order.PRODUCTION_ORDER_FINAL_STATUS = 'PENDING';
        }
      } else if (currentWF.APPROVAL_WORKFLOW_APPROVAL_LEVEL === 2) {
        // final approval
        order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = 2;
        order.PRODUCTION_ORDER_STATUS = map['APPROVED'];
        order.PRODUCTION_ORDER_FINAL_STATUS = 'APPROVED';
      }
    }

    /** ───── RETURN ───── */
    if (act === 'RETURN') {
    // 1. Archive current row & insert RETURN row
    await archiveAndInsert({
        tx,
        wf: currentWF,
        orderId,
        newStatus: 'RETURN',
        remarks,
        userId,
        active: false
    });

    // 2. Decide backLevel (explicit > default previous level)

    // console.log('currentLevel:', currentWF.APPROVAL_WORKFLOW_APPROVAL_LEVEL);
    
        let backLevel;
        if (targetLevel === 0) {
        backLevel = 0; // Always return to Sales
        } else {
        backLevel = typeof targetLevel !== 'undefined'
            ? targetLevel
            : currentWF.APPROVAL_WORKFLOW_APPROVAL_LEVEL - 1;
        }

        // 3. If going back to SPC Manager or Production (level >=1)
        console.log("backlevel : ",backLevel+" targetLevel :",targetLevel)
        
            

        if (backLevel >= 1) {
            const prevWF = await ApprovalWorkflow.findOne({
            where: {
                APPROVAL_WORKFLOW_ORDER_ID: orderId,
                APPROVAL_WORKFLOW_APPROVAL_LEVEL: backLevel
            },
            transaction: tx
            });
            if (prevWF) {
            await prevWF.update(
                { APPROVAL_WORKFLOW_IS_ACTIVE: true },
                { transaction: tx }
            );
            }

            order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = backLevel;
            order.PRODUCTION_ORDER_STATUS =
            map[`RETURN_LEVEL_${backLevel}`] || map['RETURN'];
            order.PRODUCTION_ORDER_FINAL_STATUS = 'RETURN';
        } else {
            // 4. Back to Sales (level 0) – create / activate Sales pending row
            let salesWF = await ApprovalWorkflow.findOne({
            where: {
                APPROVAL_WORKFLOW_ORDER_ID: orderId,
                APPROVAL_WORKFLOW_APPROVAL_LEVEL: 0
            },
            transaction: tx
        });

        // If not exists, create one

        const salesRole = await Role.findOne({
            where: { ROLE_ROLE_NAME: 'sales' },
            transaction: tx
        });
        const salesRoleId = salesRole.ROLE_ID;


        
        order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL = 0;
        order.PRODUCTION_ORDER_STATUS =
        map['RETURN_LEVEL_0'] || map['RETURN_TO_SALES'] || 'Returned to Sales';
        order.PRODUCTION_ORDER_FINAL_STATUS = 'RETURN';
    }
    }

    /** ───── REJECT ───── */
    if (act === 'REJECT') {
      await archiveAndInsert({
        tx,
        wf: currentWF,
        orderId,
        newStatus: 'REJECTED',
        remarks,
        userId,
        active:false
      });
      const higherWFs = await ApprovalWorkflow.findAll({
        where: {
          APPROVAL_WORKFLOW_ORDER_ID: orderId,
          APPROVAL_WORKFLOW_APPROVAL_LEVEL: {
            [Op.gt]: currentWF.APPROVAL_WORKFLOW_APPROVAL_LEVEL
          }
        },
        transaction: tx
      });
      for (const wf of higherWFs) {
        await wf.update({ APPROVAL_WORKFLOW_IS_ACTIVE: false }, { transaction: tx });
      }
      order.PRODUCTION_ORDER_FINAL_STATUS = `REJECTED_LEVEL_${currentWF.APPROVAL_WORKFLOW_APPROVAL_LEVEL}`;
      order.PRODUCTION_ORDER_STATUS =
        map[`REJECTED_LEVEL_${currentWF.APPROVAL_WORKFLOW_APPROVAL_LEVEL}`] ||
        map['REJECTED'];
    }

   

    // save order
    order.PRODUCTION_ORDER_MODIFIED_BY = userId;
    order.PRODUCTION_ORDER_MODIFIED_ON = new Date();
    await order.save({ transaction: tx, userId });
    await tx.commit();
    return order.toJSON();
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

/** ─────────────────────────────
 * Delete order (admin only)
 * ───────────────────────────── */
async function deleteOrder(orderId, adminUserId) {
  if (!adminUserId) throw new Error('Admin userId is required');

  const tx = await sequelize.transaction();
  try {
    // 1. Get the admin user and role
    const user = await User.findByPk(adminUserId, {
      include: [{ model: Role, as: 'Role' }],
      transaction: tx
    });
    if (!user) throw new Error('User not found');
    if (!user.Role || user.Role.ROLE_ROLE_NAME.toLowerCase() !== 'admin') {
      throw new Error('User is not authorized to delete orders');
    }

    // 2. Get the order
    const order = await ProductionOrder.findByPk(orderId, { transaction: tx });
    if (!order) throw new Error('Order not found');

    // 3. Guard: already deleted?
    if (order.PRODUCTION_ORDER_FINAL_STATUS === 'DELETED' || order.PRODUCTION_ORDER_IS_ACTIVE === false) {
      await tx.rollback();
      return { message: `Order ${orderId} already deleted.` };
    }

    // 4. Get deleted status value from CodeMaster
    const deletedStatus = await CodeMaster.findOne({
      where: {
        CODE_MASTER_CATEGORY: 'ORDER_STATUS',
        CODE_MASTER_KEY: 'DELETED',
        CODE_MASTER_IS_ACTIVE: true
      },
      transaction: tx
    });
    if (!deletedStatus) throw new Error('DELETED status not defined');

    // 5. Update order fields
    order.PRODUCTION_ORDER_FINAL_STATUS = deletedStatus.CODE_MASTER_KEY;
    order.PRODUCTION_ORDER_STATUS = deletedStatus.CODE_MASTER_VALUE;
    order.PRODUCTION_ORDER_IS_ACTIVE = false;
    await order.save({
      transaction: tx,
      individualHooks: true,
      userId: adminUserId
    });

    // 6. Deactivate active workflows
    await ApprovalWorkflow.update(
      {
        APPROVAL_WORKFLOW_IS_ACTIVE: false,
        APPROVAL_WORKFLOW_MODIFIED_BY: adminUserId,
        APPROVAL_WORKFLOW_MODIFIED_ON: new Date()
      },
      {
        where: {
          APPROVAL_WORKFLOW_ORDER_ID: orderId,
          APPROVAL_WORKFLOW_IS_ACTIVE: true
        },
        transaction: tx
      }
    );

    // 7. Create DELETED workflow row if not already there
    const existingDeletedWF = await ApprovalWorkflow.findOne({
      where: {
        APPROVAL_WORKFLOW_ORDER_ID: orderId,
        APPROVAL_WORKFLOW_STATUS: 'DELETED'
      },
      transaction: tx
    });

    if (!existingDeletedWF) {
      await ApprovalWorkflow.create(
        {
          APPROVAL_WORKFLOW_ORDER_ID: orderId,
          APPROVAL_WORKFLOW_ROLE_ID: user.Role.ROLE_ID,
          APPROVAL_WORKFLOW_APPROVAL_LEVEL: 99,
          APPROVAL_WORKFLOW_STATUS: 'DELETED',
          APPROVAL_WORKFLOW_ACTION_TYPE: 'DELETED',
          APPROVAL_WORKFLOW_REMARKS: 'Order deleted by admin',
          APPROVAL_WORKFLOW_IS_ACTIVE: false
        },
        { transaction: tx, individualHooks: true, userId: adminUserId }
      );
    }

    await tx.commit();
    return { message: `Order ${orderId} successfully deleted by admin.` };
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

module.exports = {
  createApprovalWorkflow,
  handleApproval,
  getOrderStatusMap,
  deleteOrder,
  getOrderHistory
};