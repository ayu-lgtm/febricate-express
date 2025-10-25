import React, { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Typography,
  Select,
  Option,
  Alert,
} from "@material-tailwind/react";
import { QrCodeIcon, PrinterIcon, DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import { QRCodeCanvas } from "qrcode.react";
import { useReactToPrint } from "react-to-print";

// Sample FG materials for autocomplete
const sampleFGMaterials = [
  { code: "FG-1001", description: "Ribbed Mesh 8mm" },
  { code: "FG-1002", description: "Ribbed Mesh 10mm" },
  { code: "FG-2001", description: "Plain Mesh 6mm" },
  { code: "FG-2002", description: "Plain Mesh 12mm" },
];

// Sample customers
const sampleCustomers = [
  "Tata Steel",
  "JSW Steel",
  "L&T Construction",
  "Adani Infrastructure",
  "Godrej Properties"
];

export function TagPrintScreen({ currentUser, permissions }) {
  const [form, setForm] = useState({
    fgMaterialNo: "FG-1001",
    fgBatchId: "B" + Math.floor(1000 + Math.random() * 9000),
    numberOfSheets: "50",
    customerName: "Tata Steel",
    quantity: "2.5",
    unit: "MT",
    loadingListFile: null,
    specialInstructions: "",
  });

  const [qrData, setQrData] = useState(null);
  const [printMode, setPrintMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const printRef = useRef();
  const qrCodeRef = useRef();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleGenerateQR = () => {
    const { loadingListFile, ...qrPayload } = form;
    
    // Simulate file content reading
    const fileContent = loadingListFile 
      ? `File: ${loadingListFile.name} (${(loadingListFile.size / 1024).toFixed(1)}KB)`
      : "No loading list attached";
    
    const fullPayload = {
      ...qrPayload,
      loadingList: fileContent,
      generatedAt: new Date().toISOString(),
      system: "SmartFAB Production v2.1"
    };
    
    setQrData(JSON.stringify(fullPayload, null, 2));
    setSuccessMessage("QR code generated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { size: 80mm 100mm; margin: 0; }
      @media print { 
        body { -webkit-print-color-adjust: exact; } 
        .no-print { display: none; }
      }
    `,
    onAfterPrint: () => setPrintMode(false),
  });

  const handlePrintPreview = () => {
    if (!qrData) {
      handleGenerateQR();
    }
    setPrintMode(true);
    setTimeout(handlePrint, 500); // Small delay to ensure DOM updates
  };

  const getMaterialDescription = (code) => {
    const material = sampleFGMaterials.find(m => m.code === code);
    return material ? material.description : "";
  };

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector("canvas");
      if (canvas) {
        const link = document.createElement("a");
        link.download = `QR_${form.fgMaterialNo}_${form.fgBatchId}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50">
      {!printMode ? (
        <Card className="w-full max-w-4xl mx-auto shadow-lg border border-gray-200">
          <CardHeader floated={false} shadow={false} className="rounded-none bg-blue-800 p-6">
            <div className="flex items-center justify-between">
              <Typography variant="h5" className="text-white flex items-center gap-2">
                <QrCodeIcon className="h-6 w-6" /> Bundle Tag Generation
              </Typography>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  color="green" 
                  className="flex items-center gap-1"
                  onClick={handleGenerateQR}
                  disabled={!form.fgMaterialNo || !form.fgBatchId}
                >
                  <QrCodeIcon className="h-4 w-4" /> Generate QR
                </Button>
                <Button 
                  size="sm" 
                  color="blue-gray" 
                  className="flex items-center gap-1"
                  onClick={handlePrintPreview}
                  disabled={!qrData}
                >
                  <PrinterIcon className="h-4 w-4" /> Print Preview
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardBody className="flex flex-col gap-6">
            {successMessage && (
              <Alert color="green" className="mb-4">
                {successMessage}
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label="FG Material No *"
                  name="fgMaterialNo"
                  value={form.fgMaterialNo}
                  onChange={(value) => setForm({...form, fgMaterialNo: value})}
                >
                  {sampleFGMaterials.map((material) => (
                    <Option key={material.code} value={material.code}>
                      {material.code} - {material.description}
                    </Option>
                  ))}
                </Select>
                {form.fgMaterialNo && (
                  <Typography variant="small" className="mt-1 text-gray-600">
                    {getMaterialDescription(form.fgMaterialNo)}
                  </Typography>
                )}
              </div>

              <div>
                <Input
                  label="FG Batch ID *"
                  name="fgBatchId"
                  value={form.fgBatchId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  type="number"
                  label="Number of Sheets *"
                  name="numberOfSheets"
                  value={form.numberOfSheets}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Select
                  label="Customer Name *"
                  name="customerName"
                  value={form.customerName}
                  onChange={(value) => setForm({...form, customerName: value})}
                >
                  {sampleCustomers.map((customer) => (
                    <Option key={customer} value={customer}>
                      {customer}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    label="Quantity *"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    containerProps={{ className: "flex-1" }}
                  />
                  <Select
                    label="Unit"
                    name="unit"
                    value={form.unit}
                    onChange={(value) => setForm({...form, unit: value})}
                    containerProps={{ className: "w-24" }}
                  >
                    <Option value="MT">MT</Option>
                    <Option value="KG">KG</Option>
                    <Option value="NOS">NOS</Option>
                  </Select>
                </div>
              </div>

              <div className="md:col-span-2">
                <Input
                  type="file"
                  label="Upload Packing List / Loading List"
                  name="loadingListFile"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                  icon={<DocumentArrowUpIcon className="h-5 w-5" />}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Special Instructions"
                  name="specialInstructions"
                  value={form.specialInstructions}
                  onChange={handleChange}
                />
              </div>
            </div>

            {qrData && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6">QR Code Preview</Typography>
                  <Button 
                    size="sm" 
                    variant="outlined" 
                    onClick={downloadQRCode}
                  >
                    Download QR
                  </Button>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div ref={qrCodeRef} className="p-2 bg-white rounded border">
                    <QRCodeCanvas 
                      value={qrData} 
                      size={128} 
                      level="H" 
                      includeMargin={true}
                    />
                  </div>
                  <div className="bg-white p-4 rounded border max-w-md">
                    <Typography variant="small" className="font-mono whitespace-pre-wrap break-words">
                      {qrData}
                    </Typography>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="flex justify-center items-start p-4">
          <div ref={printRef} className="w-[80mm] h-[100mm] p-2 border-2 border-dashed border-gray-300 bg-white">
            {/* Tag Design */}
            <div className="flex flex-col h-full">
              <header className="bg-blue-800 text-white p-2 text-center">
                <Typography variant="h6" className="font-bold">
                  {form.customerName}
                </Typography>
              </header>
              
              <div className="flex-1 p-2 grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-3 text-center py-2">
                  <QRCodeCanvas 
                    value={qrData} 
                    size={100} 
                    level="H" 
                    includeMargin={false}
                  />
                </div>
                
                <div className="font-semibold">Material:</div>
                <div className="col-span-2">{form.fgMaterialNo}</div>
                
                <div className="font-semibold">Batch ID:</div>
                <div className="col-span-2">{form.fgBatchId}</div>
                
                <div className="font-semibold">Sheets:</div>
                <div className="col-span-2">{form.numberOfSheets}</div>
                
                <div className="font-semibold">Quantity:</div>
                <div className="col-span-2">{form.quantity} {form.unit}</div>
                
                {form.specialInstructions && (
                  <>
                    <div className="font-semibold col-span-3 mt-1">Instructions:</div>
                    <div className="col-span-3 text-xs">{form.specialInstructions}</div>
                  </>
                )}
              </div>
              
              <footer className="text-center text-xs p-1 border-t border-gray-300">
                <div>Generated on: {new Date().toLocaleString()}</div>
                <div className="font-bold">Scan QR for loading list</div>
              </footer>
            </div>
          </div>
          
          <div className="ml-4 no-print">
            <Button 
              color="blue" 
              className="flex items-center gap-2 mb-4"
              onClick={handlePrint}
            >
              <PrinterIcon className="h-5 w-5" /> Print Now
            </Button>
            <Button 
              variant="outlined" 
              color="red"
              onClick={() => setPrintMode(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}