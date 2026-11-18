import { useState } from "react";
import { Header } from "../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  CheckCircle2, 
  Upload, 
  FileText, 
  Download,
  AlertCircle,
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";

type DocumentStatus = 'verified' | 'pending' | 'rejected';

interface Document {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  uploadDate: string;
  fileSize?: string;
}

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'SA ID Front',
      type: 'Identification',
      status: 'verified',
      uploadDate: 'Jan 15, 2026',
      fileSize: '2.3 MB'
    },
    {
      id: '2',
      name: 'SA ID Back',
      type: 'Identification',
      status: 'verified',
      uploadDate: 'Jan 15, 2026',
      fileSize: '2.1 MB'
    },
    {
      id: '3',
      name: 'PrDP',
      type: 'Driving Permit',
      status: 'verified',
      uploadDate: 'Jan 15, 2026',
      fileSize: '1.8 MB'
    },
    {
      id: '4',
      name: 'Bank Statements',
      type: 'Financial',
      status: 'verified',
      uploadDate: 'Jan 15, 2026',
      fileSize: '5.4 MB'
    },
    {
      id: '5',
      name: 'Uber Screenshot',
      type: 'Employment',
      status: 'verified',
      uploadDate: 'Jan 15, 2026',
      fileSize: '1.2 MB'
    },
    {
      id: '6',
      name: 'Proof of Residence',
      type: 'Address Verification',
      status: 'verified',
      uploadDate: 'Jan 15, 2026',
      fileSize: '3.1 MB'
    },
  ]);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState('');

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, this would upload to server
      console.log('Uploading file:', file.name);
      setUploadDialogOpen(false);
    }
  };

  const documentTypes = [
    { value: 'sa-id-front', label: 'SA ID - Front' },
    { value: 'sa-id-back', label: 'SA ID - Back' },
    { value: 'passport', label: 'Passport (for foreign nationals)' },
    { value: 'prdp', label: 'PrDP' },
    { value: 'bank-statements', label: 'Bank Statements' },
    { value: 'uber-screenshot', label: 'Uber Screenshot' },
    { value: 'proof-residence', label: 'Proof of Residence' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Documents</h1>
            <p className="text-gray-600">Manage and track your uploaded documents</p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00C853] hover:bg-[#00b84a]">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-type">Document Type</Label>
                  <select
                    id="doc-type"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                  >
                    <option value="">Select document type...</option>
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#00C853] transition-colors">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG or PDF (max. 10MB)</p>
                    </label>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="space-y-1 text-xs text-blue-800">
                    <li>• Upload clear photos of original documents</li>
                    <li>• SA ID required for South African citizens</li>
                    <li>• Passport required for foreign nationals & asylum seekers</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Document Status Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Documents</p>
                  <p className="text-3xl font-bold">{documents.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verified</p>
                  <p className="text-3xl font-bold text-green-600">
                    {documents.filter(d => d.status === 'verified').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {documents.filter(d => d.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Header Row - Hidden on mobile */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-600 border-b">
                <div className="col-span-4">Document</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Upload Date</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Document Rows */}
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 rounded-lg border-b md:border-b-0"
                >
                  <div className="md:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(doc.status)}
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500 md:hidden">{doc.type}</p>
                      {doc.fileSize && (
                        <p className="text-xs text-gray-400">{doc.fileSize}</p>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:flex md:col-span-2 items-center text-sm text-gray-600">
                    {doc.type}
                  </div>
                  <div className="md:col-span-2 flex items-center">
                    {getStatusBadge(doc.status)}
                  </div>
                  <div className="md:col-span-2 flex items-center text-sm text-gray-600">
                    {doc.uploadDate}
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Document Requirements</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853] mt-0.5 flex-shrink-0" />
                    <span><strong>South African citizens:</strong> Upload clear photos of both sides of your SA ID card</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853] mt-0.5 flex-shrink-0" />
                    <span><strong>Foreign nationals & asylum seekers:</strong> Upload a clear photo of your passport bio page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853] mt-0.5 flex-shrink-0" />
                    <span>All documents must be valid and clearly legible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853] mt-0.5 flex-shrink-0" />
                    <span>Bank statements must cover the last 3 months</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00C853] mt-0.5 flex-shrink-0" />
                    <span>Proof of residence must be dated within the last 3 months</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
