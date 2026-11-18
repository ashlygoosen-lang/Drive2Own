import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import { CheckCircle2, Upload, AlertCircle } from "lucide-react";

type Step = 'info' | 'documents' | 'payment' | 'success';

export function Join() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    uberId: '',
    agreedToTerms: false,
  });
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploads, setUploads] = useState({
    saIdFront: null as File | null,
    saIdBack: null as File | null,
    passport: null as File | null,
    prdp: null as File | null,
    bankStatements: null as File | null,
    uberScreenshot: null as File | null,
    proofOfResidence: null as File | null,
  });

  const handleFileChange = (field: keyof typeof uploads, file: File | null) => {
    setUploads(prev => ({ ...prev, [field]: file }));
    
    // Calculate upload progress
    const totalFields = Object.keys(uploads).length;
    const uploadedFields = Object.values({ ...uploads, [field]: file }).filter(f => f !== null).length;
    setUploadProgress((uploadedFields / totalFields) * 100);
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.phone && formData.uberId && formData.agreedToTerms) {
      setCurrentStep('documents');
    }
  };

  const handleSubmitDocuments = () => {
    // Check if at least SA ID or Passport is uploaded
    const hasValidId = (uploads.saIdFront && uploads.saIdBack) || uploads.passport;
    if (hasValidId && uploads.prdp && uploads.bankStatements && uploads.uberScreenshot && uploads.proofOfResidence) {
      setCurrentStep('payment');
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('success');
  };

  const FileUploadZone = ({ 
    label, 
    field, 
    required = true,
    helpText 
  }: { 
    label: string; 
    field: keyof typeof uploads; 
    required?: boolean;
    helpText?: string;
  }) => (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00C853] transition-colors cursor-pointer">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
          className="hidden"
          id={field}
        />
        <label htmlFor={field} className="cursor-pointer">
          {uploads[field] ? (
            <div className="flex items-center justify-center gap-2 text-[#00C853]">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm">{uploads[field]!.name}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">PNG, JPG or PDF (max. 10MB)</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {['Info', 'Documents', 'Payment', 'Success'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ['info', 'documents', 'payment', 'success'].indexOf(currentStep) >= index
                    ? 'bg-[#00C853] text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm hidden sm:inline ${
                  ['info', 'documents', 'payment', 'success'].indexOf(currentStep) >= index
                    ? 'text-[#00C853] font-medium'
                    : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < 3 && <div className="w-8 sm:w-16 h-0.5 bg-gray-300 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 'info' && (
          <Card>
            <CardHeader>
              <CardTitle>Join Drive2Own</CardTitle>
              <CardDescription>
                Start your journey to vehicle ownership. Complete this quick form to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitInfo} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
                      🇿🇦 +27
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="82 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uberId">Uber Driver ID / Profile Link *</Label>
                  <Input
                    id="uberId"
                    placeholder="https://partners.uber.com/..."
                    value={formData.uberId}
                    onChange={(e) => setFormData({ ...formData, uberId: e.target.value })}
                    required
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, agreedToTerms: checked as boolean })
                    }
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                    I am an active Uber driver in Cape Town with a valid SA ID or passport
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#00C853] hover:bg-[#00b84a]"
                  disabled={!formData.fullName || !formData.phone || !formData.uberId || !formData.agreedToTerms}
                >
                  Next – Upload Documents
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Document Upload */}
        {currentStep === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Documents</CardTitle>
              <CardDescription>
                Upload clear photos of your original documents. We accept South African citizens (SA ID required) 
                and foreign nationals/asylum seekers (passport required).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• All uploads must be clear photos of original documents</li>
                    <li>• South African citizens: Upload SA ID (front & back)</li>
                    <li>• Foreign nationals & asylum seekers: Upload passport</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Identification Documents</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FileUploadZone 
                    label="SA ID – Front" 
                    field="saIdFront"
                    required={false}
                    helpText="For South African citizens only"
                  />
                  <FileUploadZone 
                    label="SA ID – Back" 
                    field="saIdBack"
                    required={false}
                    helpText="For South African citizens only"
                  />
                  <FileUploadZone 
                    label="Passport" 
                    field="passport"
                    required={false}
                    helpText="For foreign nationals & asylum seekers"
                  />
                  <FileUploadZone 
                    label="PrDP (Professional Driving Permit)" 
                    field="prdp"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Financial & Proof Documents</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FileUploadZone 
                    label="3 Months Bank Statements" 
                    field="bankStatements"
                    helpText="PDF or images accepted"
                  />
                  <FileUploadZone 
                    label="Uber Earnings/Profile Screenshot" 
                    field="uberScreenshot"
                  />
                  <FileUploadZone 
                    label="Proof of Residence" 
                    field="proofOfResidence"
                    helpText="Utility bill ≤ 3 months old"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('info')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitDocuments}
                  className="flex-1 bg-[#00C853] hover:bg-[#00b84a]"
                  disabled={uploadProgress < 100}
                >
                  Next – Payment Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Payment */}
        {currentStep === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>Initial Payment</CardTitle>
              <CardDescription>
                Complete your initial payment to activate your Drive2Own account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Initial Deposit</span>
                    <span className="text-2xl font-bold text-[#00C853]">R 5,000</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    This deposit goes toward your vehicle ownership
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" type="password" maxLength={3} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setCurrentStep('documents')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-[#00C853] hover:bg-[#00b84a]"
                  >
                    Complete Payment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {currentStep === 'success' && (
          <Card>
            <CardContent className="py-12 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#00C853]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Welcome to Drive2Own!</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your application has been submitted successfully. Our team will review your documents 
                  and contact you within 24 hours.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-medium mb-4">What's Next?</h3>
                <ul className="text-left space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                    <span>We'll verify your documents (24 hours)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                    <span>You'll receive login credentials via SMS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#00C853] flex-shrink-0 mt-0.5" />
                    <span>Start tracking your ownership progress</span>
                  </li>
                </ul>
              </div>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-[#00C853] hover:bg-[#00b84a]"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
