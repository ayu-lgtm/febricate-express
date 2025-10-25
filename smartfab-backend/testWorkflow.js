// 📁 test/testRealisticWorkflowCycle.js
const { handleWorkflowUpdate } = require('./services/approvalDashboardService');
const { ProductionOrder, ApprovalWorkflow, sequelize } = require('./models');
const { getUserFromToken } = require('./services/authServices');

async function testRealisticWorkflowCycle() {
  const transaction = await sequelize.transaction();
  try {
    const orderId = '2123-SEP-001';
    let order = await ProductionOrder.findByPk(orderId, { transaction });
    console.log('\n--- Initial Order ---');
    console.log(order.PRODUCTION_ORDER_STATUS, order.PRODUCTION_ORDER_FINAL_STATUS);

    const fakeToken = 'Gv9XlKLRRDsxO2f43AVGpV2acCxWJ0kWXL2kG9kLri0=';
    const { userID } = await getUserFromToken(fakeToken);

    // ===== STEP 1: Level 1 Approves =====
    console.log('\n--- STEP 1: Level 1 Approves ---');
    const level1 = await ApprovalWorkflow.findAll({
      where: { APPROVAL_WORKFLOW_ORDER_ID: orderId, APPROVAL_WORKFLOW_APPROVAL_LEVEL: 1 },
      transaction
    });

    for (const wf of level1) {
      wf.APPROVAL_WORKFLOW_STATUS = 'APPROVED';
      await handleWorkflowUpdate(wf, fakeToken);

      const updatedWF = await ApprovalWorkflow.findByPk(wf.APPROVAL_WORKFLOW_ID, { transaction });
      console.log(`Workflow ID: ${updatedWF.APPROVAL_WORKFLOW_ID} approved by UserID: ${updatedWF.APPROVAL_WORKFLOW_MODIFIED_BY}`);
    }

    order = await ProductionOrder.findByPk(orderId, { transaction });
    console.log('After Level 1 Approval:', order.PRODUCTION_ORDER_STATUS, order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL);

    // ===== STEP 2: Level 2 Rejects =====
    // console.log('\n--- STEP 2: Level 2 Rejects ---');
    // const level2 = await ApprovalWorkflow.findAll({
    //   where: { APPROVAL_WORKFLOW_ORDER_ID: orderId, APPROVAL_WORKFLOW_APPROVAL_LEVEL: 2 },
    //   transaction
    // });

    // for (const wf of level2) {
    //   wf.APPROVAL_WORKFLOW_STATUS = 'REJECTED';
    //   wf.APPROVAL_WORKFLOW_REMARKS = 'Material unavailable';
    //   await handleWorkflowUpdate(wf, fakeToken);

    //   const updatedWF = await ApprovalWorkflow.findByPk(wf.APPROVAL_WORKFLOW_ID, { transaction });
    //   console.log(`Workflow ID: ${updatedWF.APPROVAL_WORKFLOW_ID} rejected by UserID: ${updatedWF.APPROVAL_WORKFLOW_MODIFIED_BY} at ${updatedWF.APPROVAL_WORKFLOW_ACTION_DATE}`);
    // }

    // order = await ProductionOrder.findByPk(orderId, { transaction });
    // console.log('After Level 2 Rejection:', order.PRODUCTION_ORDER_STATUS, order.PRODUCTION_ORDER_FINAL_STATUS);

    // ===== STEP 3: Level 1 Re-Approval =====
    // console.log('\n--- STEP 3: Level 1 Re-Approval ---');
    // for (const wf of level1) {
    //   wf.APPROVAL_WORKFLOW_STATUS = 'APPROVED';
    //   await handleWorkflowUpdate(wf, fakeToken);
    // }

    // order = await ProductionOrder.findByPk(orderId, { transaction });
    // console.log('After Level 1 Re-Approval:', order.PRODUCTION_ORDER_STATUS, order.PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL);

    // // ===== STEP 4: Level 2 Approves =====
    // console.log('\n--- STEP 4: Level 2 Approves ---');
    // for (const wf of level2) {
    //   wf.APPROVAL_WORKFLOW_STATUS = 'APPROVED';
    //   await handleWorkflowUpdate(wf, fakeToken);
    // }

    // order = await ProductionOrder.findByPk(orderId, { transaction });
    // console.log('After Level 2 Approval:', order.PRODUCTION_ORDER_STATUS, order.PRODUCTION_ORDER_FINAL_STATUS);

    // ===== STEP 5: Re-Approve Already Approved Level 1 =====
    // console.log('\n--- STEP 5: Re-Approve Level 1 (No new row expected) ---');
    // for (const wf of level1) {
    //   wf.APPROVAL_WORKFLOW_STATUS = 'APPROVED';
    //   await handleWorkflowUpdate(wf, fakeToken);
    // }

    // order = await ProductionOrder.findByPk(orderId, { transaction });
    // console.log('After Re-Approving Level 1:', order.PRODUCTION_ORDER_STATUS, order.PRODUCTION_ORDER_FINAL_STATUS);

    await transaction.commit();
    console.log('\nAll workflow test cases executed and committed successfully.');
  } catch (err) {
    await transaction.rollback();
    console.error('Test failed, rolled back:', err);
  }
}

testRealisticWorkflowCycle();