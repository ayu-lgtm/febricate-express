import React, { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  Option,
  Button,
  Typography,
  Textarea,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";
import { QRCodeCanvas } from "qrcode.react";
import { PrinterIcon, DocumentArrowUpIcon, StarIcon } from "@heroicons/react/24/solid";
import { useReactToPrint } from "react-to-print";

// Real-world Tata Steel test cases
const testCases = [
  {
    doNumber: "DO-JSR-2023-04567",
    lineItem: "HR Coils - 2.5mm",
    storageLocation: "Jamshedpur Plant 1",
    quantity: "150",
    batch: "BATCH-JSR-2305-12",
    numberOfSheets: "75",
    vehicleType: "CatA",
    vehicleNumber: "JH05AB1234",
    grossWeight: "24500",
    tareWeight: "9500",
    packingQuality: 4,
    deliverySafety: 5,
    remarks: "Urgent delivery for TATA Motors"
  },
  {
    doNumber: "DO-KNG-2023-07891",
    lineItem: "CR Sheets - 1.2mm",
    storageLocation: "Kalinganagar Plant",
    quantity: "200",
    batch: "BATCH-KNG-2306-05",
    numberOfSheets: "100",
    vehicleType: "CatB",
    vehicleNumber: "OR02CD5678",
    grossWeight: "32000",
    tareWeight: "12000",
    packingQuality: 3,
    deliverySafety: 4,
    remarks: "Regular supply to vendor"
  },
  {
    doNumber: "DO-JSR-2023-05678",
    lineItem: "GP Sheets - 0.8mm",
    storageLocation: "Jamshedpur Plant 2",
    quantity: "180",
    batch: "BATCH-JSR-2306-08",
    numberOfSheets: "90",
    vehicleType: "TSL_Internal",
    vehicleNumber: "TSL-INT-452",
    grossWeight: "28000",
    tareWeight: "10000",
    packingQuality: 5,
    deliverySafety: 5,
    remarks: "Internal transfer to finishing unit"
  }
];

const vehicleTypes = [
  { value: "CatA", label: "Category A (Tata Motors)" },
  { value: "CatB", label: "Category B (External)" },
  { value: "TSL_Internal", label: "TSL Internal Vehicle" },
];

export function SmartInvoicing({ currentUser, permissions }) {
  const [form, setForm] = useState({
    doNumber: "",
    lineItem: "",
    storageLocation: "Jamshedpur Plant 1",
    quantity: "",
    batch: "",
    numberOfSheets: "",
    vehicleType: "",
    vehicleNumber: "",
    grossWeight: "",
    tareWeight: "",
    packingQuality: 3,
    deliverySafety: 3,
    remarks: "",
  });

  const [qrData, setQrData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTestCaseDialog, setOpenTestCaseDialog] = useState(false);
  const [alert, setAlert] = useState(null);
  const printRef = useRef();
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateQR = () => {
    if (!form.doNumber || !form.vehicleNumber || !form.grossWeight || !form.tareWeight) {
      setAlert({
        color: "red",
        message: "Please fill all required fields (DO Number, Vehicle Number, Weights)"
      });
      return;
    }

    if (parseFloat(form.grossWeight) <= parseFloat(form.tareWeight)) {
      setAlert({
        color: "red",
        message: "Gross weight must be greater than tare weight"
      });
      return;
    }

    const payload = {
      ...form,
      dateOfReceiving: new Date().toISOString(),
      generatedAt: new Date().toLocaleString(),
      system: "Tata Steel SmartFAB v2.0",
      netWeight: (parseFloat(form.grossWeight) - parseFloat(form.tareWeight)).toFixed(2)
    };
    setQrData(JSON.stringify(payload, null, 2));
    setOpenDialog(true);
    setAlert({
      color: "green",
      message: "Invoice QR generated successfully!"
    });
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { 
        size: 80mm 120mm; 
        margin: 0;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact;
        }
        .no-print { 
          display: none; 
        }
      }
    `,
    onAfterPrint: () => {
      setAlert({
        color: "blue",
        message: "Invoice printed successfully!"
      });
    }
  });

  const handleRatingChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const loadTestCase = (testCase) => {
    setForm(testCase);
    setOpenTestCaseDialog(false);
    setAlert({
      color: "blue",
      message: `Loaded test case: ${testCase.doNumber}`
    });
  };

  const renderStars = (field) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5 cursor-pointer ${
              star <= form[field] ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
            onClick={() => handleRatingChange(field, star)}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {form[field]} {form[field] === 1 ? "star" : "stars"}
        </span>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {alert && (
        <Alert
          color={alert.color}
          className="mb-4 max-w-4xl mx-auto"
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <Card className="w-full max-w-4xl mx-auto shadow-xl border border-gray-200">
        <CardHeader floated={false} shadow={false} className="rounded-none bg-blue-800 p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h4" className="text-white flex items-center gap-2">
              <DocumentArrowUpIcon className="h-6 w-6" /> Tata Steel Smart Invoicing
            </Typography>
            <Button
              size="sm"
              color="amber"
              onClick={() => setOpenTestCaseDialog(true)}
            >
              Load Test Case
            </Button>
          </div>
        </CardHeader>

        <CardBody className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="DO Number *"
              name="doNumber"
              value={form.doNumber}
              onChange={handleChange}
              required
            />
            <Input
              label="Line Item *"
              name="lineItem"
              value={form.lineItem}
              onChange={handleChange}
              required
            />
            <Select
              label="Storage Location *"
              name="storageLocation"
              value={form.storageLocation}
              onChange={(value) => setForm({...form, storageLocation: value})}
            >
              <Option value="Jamshedpur Plant 1">Jamshedpur Plant 1</Option>
              <Option value="Jamshedpur Plant 2">Jamshedpur Plant 2</Option>
              <Option value="Kalinganagar Plant">Kalinganagar Plant</Option>
            </Select>
            <Input
              label="Quantity (MT) *"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              type="number"
              required
            />
            <Input
              label="Batch Number *"
              name="batch"
              value={form.batch}
              onChange={handleChange}
              required
            />
            <Input
              label="Number of Sheets *"
              name="numberOfSheets"
              value={form.numberOfSheets}
              onChange={handleChange}
              type="number"
              required
            />
            <Select
              label="Vehicle Type *"
              name="vehicleType"
              value={form.vehicleType}
              onChange={(value) => setForm({...form, vehicleType: value})}
              required
            >
              {vehicleTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
            <Input
              label="Vehicle Number *"
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={handleChange}
              required
            />
            <Input
              label="Gross Weight (kg) *"
              name="grossWeight"
              type="number"
              value={form.grossWeight}
              onChange={handleChange}
              required
            />
            <Input
              label="Tare Weight (kg) *"
              name="tareWeight"
              type="number"
              value={form.tareWeight}
              onChange={handleChange}
              required
            />
            <div className="md:col-span-2 bg-gray-50 p-3 rounded-lg">
              <Typography variant="h6" className="mb-1">
                Calculated Net Weight: {form.grossWeight && form.tareWeight ? 
                  (parseFloat(form.grossWeight) - parseFloat(form.tareWeight)).toFixed(2) + " kg" : 
                  "Enter weights to calculate"}
              </Typography>
            </div>
          </div>

          <div className="md:col-span-2">
            <Typography variant="h6" className="mb-2 text-gray-700">
              Packing Quality Feedback
            </Typography>
            {renderStars("packingQuality")}
          </div>

          <div className="md:col-span-2">
            <Typography variant="h6" className="mb-2 text-gray-700">
              Delivery Safety Rating
            </Typography>
            {renderStars("deliverySafety")}
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outlined"
              color="red"
              onClick={() => setForm({
                doNumber: "",
                lineItem: "",
                storageLocation: "Jamshedpur Plant 1",
                quantity: "",
                batch: "",
                numberOfSheets: "",
                vehicleType: "",
                vehicleNumber: "",
                grossWeight: "",
                tareWeight: "",
                packingQuality: 3,
                deliverySafety: 3,
                remarks: "",
              })}
            >
              Clear Form
            </Button>
            <Button
              color="blue"
              onClick={handleGenerateQR}
              disabled={!form.doNumber || !form.vehicleNumber}
            >
              Generate Invoice QR
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={openDialog} handler={() => setOpenDialog(false)} size="lg">
        <DialogHeader>Invoice QR Code - DO: {form.doNumber}</DialogHeader>
        <DialogBody className="flex flex-col items-center">
          <div ref={printRef} className="p-4 border border-gray-200 rounded-lg bg-white w-full max-w-md">
            <div className="text-center mb-4 border-b pb-2">
              <Typography variant="h5" className="font-bold">
                Tata Steel Delivery
              </Typography>
              <Typography variant="small">Delivery Order: {form.doNumber}</Typography>
              <Typography variant="small" className="font-semibold">
                {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
              </Typography>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="p-2 bg-white rounded border">
                <QRCodeCanvas 
                  value={qrData} 
                  size={160} 
                  level="H" 
                  includeMargin={true}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm w-full">
                <div className="font-semibold">Line Item:</div>
                <div>{form.lineItem}</div>
                
                <div className="font-semibold">Vehicle:</div>
                <div>{form.vehicleNumber}</div>
                
                <div className="font-semibold">Type:</div>
                <div>{vehicleTypes.find(v => v.value === form.vehicleType)?.label}</div>
                
                <div className="font-semibold">Gross Wt:</div>
                <div>{form.grossWeight} kg</div>
                
                <div className="font-semibold">Tare Wt:</div>
                <div>{form.tareWeight} kg</div>
                
                <div className="font-semibold">Net Wt:</div>
                <div>{form.grossWeight && form.tareWeight ? 
                  (parseFloat(form.grossWeight) - parseFloat(form.tareWeight)).toFixed(2) + " kg" : 
                  "N/A"}</div>
                
                <div className="font-semibold">Location:</div>
                <div>{form.storageLocation}</div>
                
                <div className="font-semibold">Batch:</div>
                <div>{form.batch}</div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-xs border-t pt-2">
              <div>Packing Quality: {form.packingQuality}/5 | Safety: {form.deliverySafety}/5</div>
              <div className="font-bold mt-1">Scan QR for complete details</div>
            </div>
          </div>
          
          {/* Scrollable QR data - not included in print */}
          <div className="mt-6 bg-gray-100 p-4 rounded-lg w-full max-w-2xl overflow-y-auto" style={{ maxHeight: '200px' }}>
            <Typography variant="small" className="font-mono whitespace-pre-wrap break-words">
              {qrData}
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setOpenDialog(false)} className="mr-2">
            Close
          </Button>
          <Button 
            color="blue" 
            onClick={() => {
              handlePrint();
            }} 
            className="flex items-center gap-2"
          >
            <PrinterIcon className="h-5 w-5" /> Print Invoice
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Test Case Dialog */}
      <Dialog open={openTestCaseDialog} handler={() => setOpenTestCaseDialog(false)} size="lg">
        <DialogHeader>Load Test Case</DialogHeader>
        <DialogBody>
          <Typography variant="paragraph" className="mb-4">
            Select a real-world test scenario to populate the form:
          </Typography>
          
          <div className="grid grid-cols-1 gap-4">
            {testCases.map((testCase, index) => (
              <Card key={index} className="p-4 border border-gray-200 hover:border-blue-500 cursor-pointer"
                onClick={() => loadTestCase(testCase)}>
                <Typography variant="h6">{testCase.doNumber}</Typography>
                <Typography variant="small" className="text-gray-600">
                  {testCase.lineItem} | {testCase.storageLocation}
                </Typography>
                <Typography variant="small" className="mt-2">
                  Vehicle: {testCase.vehicleNumber} ({vehicleTypes.find(v => v.value === testCase.vehicleType)?.label})
                </Typography>
              </Card>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" onClick={() => setOpenTestCaseDialog(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}