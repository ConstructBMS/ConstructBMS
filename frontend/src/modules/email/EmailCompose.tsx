import {
  Attach,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Mail,
  Minimize2,
  Paperclip,
  Send,
  Underline,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Email, EmailCompose as EmailComposeType } from '../../lib/types/email';
import { useEmailStore } from '../../app/store/email.store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RichTextEditor } from '../../components/RichTextEditor';

interface EmailComposeProps {
  mode: 'new' | 'reply' | 'forward';
  replyToEmail?: Email | null;
  onClose: () => void;
}

export function EmailCompose({ mode, replyToEmail, onClose }: EmailComposeProps) {
  const { addEmail } = useEmailStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  
  const [formData, setFormData] = useState<EmailComposeType>({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    body: '',
    htmlBody: '',
    attachments: [],
  });

  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyToEmail) {
      if (mode === 'reply') {
        setFormData(prev => ({
          ...prev,
          to: [replyToEmail.from],
          subject: replyToEmail.subject.startsWith('Re: ') 
            ? replyToEmail.subject 
            : `Re: ${replyToEmail.subject}`,
          body: `\n\n--- Original Message ---\nFrom: ${replyToEmail.from.name} <${replyToEmail.from.email}>\nDate: ${new Date(replyToEmail.receivedAt).toLocaleString()}\nSubject: ${replyToEmail.subject}\n\n${replyToEmail.body}`,
        }));
        setToInput(replyToEmail.from.email);
      } else if (mode === 'forward') {
        setFormData(prev => ({
          ...prev,
          subject: replyToEmail.subject.startsWith('Fwd: ') 
            ? replyToEmail.subject 
            : `Fwd: ${replyToEmail.subject}`,
          body: `\n\n--- Forwarded Message ---\nFrom: ${replyToEmail.from.name} <${replyToEmail.from.email}>\nDate: ${new Date(replyToEmail.receivedAt).toLocaleString()}\nSubject: ${replyToEmail.subject}\n\n${replyToEmail.body}`,
        }));
      }
    }
  }, [mode, replyToEmail]);

  const handleSend = () => {
    if (!formData.to.length || !formData.subject.trim()) {
      alert('Please fill in the required fields (To and Subject)');
      return;
    }

    const newEmail: Email = {
      id: Date.now().toString(),
      subject: formData.subject,
      from: {
        name: 'Current User',
        email: 'user@constructbms.com',
      },
      to: formData.to,
      cc: formData.cc,
      bcc: formData.bcc,
      body: formData.body,
      htmlBody: formData.htmlBody,
      receivedAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      isRead: true,
      isImportant: false,
      isFlagged: false,
      folder: 'sent',
      labels: [],
      attachments: formData.attachments?.map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
    };

    addEmail(newEmail);
    onClose();
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    // In a real app, this would save to drafts folder
    console.log('Draft saved');
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || [],
    }));
  };

  const addEmailToList = (emailList: string, setEmailList: (value: string) => void) => {
    const emails = emailList.split(',').map(email => email.trim()).filter(Boolean);
    if (emails.length > 0) {
      const emailObjects = emails.map(email => ({
        name: email.split('@')[0],
        email: email,
      }));
      
      if (emailList === toInput) {
        setFormData(prev => ({ ...prev, to: [...prev.to, ...emailObjects] }));
      } else if (emailList === ccInput) {
        setFormData(prev => ({ ...prev, cc: [...prev.cc, ...emailObjects] }));
      } else if (emailList === bccInput) {
        setFormData(prev => ({ ...prev, bcc: [...prev.bcc, ...emailObjects] }));
      }
      
      setEmailList('');
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {mode === 'new' ? 'New Message' : mode === 'reply' ? 'Reply' : 'Forward'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          To: {formData.to.map(t => t.email).join(', ')}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Subject: {formData.subject}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'new' ? 'New Message' : mode === 'reply' ? 'Reply' : 'Forward'}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Compose Form */}
        <div className="flex-1 flex flex-col p-4 space-y-4">
          {/* To Field */}
          <div className="flex items-center gap-2">
            <Label className="w-12 text-sm font-medium">To:</Label>
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onBlur={() => addEmailToList(toInput, setToInput)}
                onKeyPress={(e) => e.key === 'Enter' && addEmailToList(toInput, setToInput)}
                placeholder="Enter email addresses"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCc(!showCc)}
              >
                Cc
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBcc(!showBcc)}
              >
                Bcc
              </Button>
            </div>
          </div>

          {/* CC Field */}
          {showCc && (
            <div className="flex items-center gap-2">
              <Label className="w-12 text-sm font-medium">Cc:</Label>
              <Input
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                onBlur={() => addEmailToList(ccInput, setCcInput)}
                onKeyPress={(e) => e.key === 'Enter' && addEmailToList(ccInput, setCcInput)}
                placeholder="Enter CC email addresses"
                className="flex-1"
              />
            </div>
          )}

          {/* BCC Field */}
          {showBcc && (
            <div className="flex items-center gap-2">
              <Label className="w-12 text-sm font-medium">Bcc:</Label>
              <Input
                value={bccInput}
                onChange={(e) => setBccInput(e.target.value)}
                onBlur={() => addEmailToList(bccInput, setBccInput)}
                onKeyPress={(e) => e.key === 'Enter' && addEmailToList(bccInput, setBccInput)}
                placeholder="Enter BCC email addresses"
                className="flex-1"
              />
            </div>
          )}

          {/* Subject Field */}
          <div className="flex items-center gap-2">
            <Label className="w-12 text-sm font-medium">Subject:</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter subject"
              className="flex-1"
            />
          </div>

          {/* Attachments */}
          {formData.attachments && formData.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg"
                >
                  <Paperclip className="h-3 w-3" />
                  <span className="text-sm">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Email Body */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAttachFile}
              >
                <Attach className="h-4 w-4 mr-2" />
                Attach
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            <RichTextEditor
              value={formData.htmlBody || formData.body}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                body: value.replace(/<[^>]*>/g, ''),
                htmlBody: value 
              }))}
              placeholder="Compose your message..."
              className="flex-1"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              Save Draft
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            {isDraft && 'Draft saved'}
          </div>
        </div>
      </div>
    </div>
  );
}
