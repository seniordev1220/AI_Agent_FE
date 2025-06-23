import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"
import { Label } from "./ui/label"
import { AlertCircle, RefreshCw, CheckCircle, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import { Checkbox } from "./ui/checkbox"

interface ConnectSourceModalProps {
  isOpen: boolean
  onClose: () => void
  selectedSource: string | null
}

interface SourceField {
  key: string
  label: string
  type: string
  required?: boolean
  multiple?: boolean
  accept?: string
  placeholder?: string
  disabled?: boolean
}

interface ValidationError {
  field: string;
  message: string;
}

export function ConnectSourceModal({ isOpen, onClose, selectedSource }: ConnectSourceModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const { data: session } = useSession();

  const getSourceFields = (): SourceField[] => {
    const commonFields: SourceField[] = [
      { 
        key: 'source_name', 
        label: 'Data Source Name', 
        type: 'text', 
        required: true,
        placeholder: `My ${selectedSource} Connection`
      }
    ];

    switch (selectedSource) {
      case 'Airtable':
        return [
          ...commonFields,
          { key: 'api_token', label: 'API Token', type: 'password', required: true },
          { key: 'base_id', label: 'Base ID', type: 'text', required: true },
          { key: 'table_id', label: 'Table ID', type: 'text', required: true },
        ];
      case 'Dropbox':
        return [
          ...commonFields,
          { key: 'dropbox_access_token', label: 'Access Token', type: 'password', required: true },
          { key: 'dropbox_folder_path', label: 'Folder Path', type: 'text', 
            placeholder: '/path/to/folder' },
          { key: 'dropbox_file_paths', label: 'File Paths (one per line)', type: 'textarea',
            placeholder: '/path/to/file1.txt\n/path/to/file2.pdf' },
          { key: 'recursive', label: 'Include Subfolders', type: 'checkbox' },
        ];
      case 'Google Drive':
        return [
          ...commonFields,
          { 
            key: 'file_ids', 
            label: 'File IDs', 
            type: 'textarea',
            required: true,
            placeholder: 'Enter Google Drive file IDs (one per line)\nExample: 1a2b3c4d5e...'
          },
          {
            key: 'info_text',
            label: 'Note',
            type: 'text',
            placeholder: 'Files must be accessible via the service account configured on the server.',
            disabled: true
          }
        ];
      case 'Slack':
        return [
          ...commonFields,
          { 
            key: 'zip_file', 
            label: 'Slack Export ZIP File', 
            type: 'file', 
            required: true,
            accept: '.zip'
          },
          { key: 'workspace_url', label: 'Workspace URL', type: 'url',
            placeholder: 'https://your-workspace.slack.com', required: true },
        ];
      case 'One Drive':
        return [
          ...commonFields,
          { key: 'client_id', label: 'Client ID', type: 'text', required: true },
          { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
          { key: 'drive_id', label: 'Drive ID', type: 'text' },
          { key: 'folder_path', label: 'Folder Path', type: 'text',
            placeholder: '/Documents/Folder' },
          { key: 'recursive', label: 'Load Recursively', type: 'checkbox' },
        ];
      case 'Sharepoint':
        return [
          ...commonFields,
          { key: 'tenant_name', label: 'Tenant Name', type: 'text', required: true },
          { key: 'collection_id', label: 'Collection ID', type: 'text', required: true },
          { key: 'subsite_id', label: 'Subsite ID', type: 'text', required: true },
          { key: 'document_library_id', label: 'Document Library ID', type: 'text' },
          { key: 'folder_path', label: 'Folder Path', type: 'text',
            placeholder: '/sites/your-site/Shared Documents' },
        ];
      case 'GitHub':
        return [
          ...commonFields,
          { key: 'access_token', label: 'GitHub Access Token', type: 'password', required: true,
            placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
          { key: 'repo', label: 'Repository', type: 'text', required: true,
            placeholder: 'owner/repo-name' },
          { key: 'branch', label: 'Branch', type: 'text',
            placeholder: 'main' },
          { key: 'file_extensions', label: 'File Extensions (comma-separated)', type: 'text',
            placeholder: '.py,.js,.md',
            required: true },
          { key: 'github_api_url', label: 'GitHub API URL', type: 'text',
            placeholder: 'https://api.github.com' },
        ];
      case 'Web Scraper':
        return [
          ...commonFields,
          { key: 'urls', label: 'URLs (one per line)', type: 'textarea', required: true,
            placeholder: 'https://example.com/page1\nhttps://example.com/page2' },
          { key: 'requests_per_second', label: 'Requests per Second', type: 'number',
            placeholder: '2' },
        ];
      case 'Snowflake':
        return [
          ...commonFields,
          { key: 'query', label: 'Query', type: 'textarea', required: true,
            placeholder: 'SELECT * FROM your_table' },
          { key: 'user', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'account', label: 'Account', type: 'text', required: true },
          { key: 'warehouse', label: 'Warehouse', type: 'text', required: true },
          { key: 'role', label: 'Role', type: 'text', required: true },
          { key: 'database', label: 'Database', type: 'text', required: true },
          { key: 'schema', label: 'Schema', type: 'text', required: true },
        ];
      case 'Upload Files':
        return [
          ...commonFields,
          { 
            key: 'files', 
            label: 'Select Files', 
            type: 'file',
            multiple: true,
            accept: '.pdf,.doc,.docx,.txt,.md,.csv',
            required: true 
          }
        ];
      case 'Salesforce':
        return [
          ...commonFields,
          { key: 'client_id', label: 'Client ID', type: 'text',
            required: true,
            placeholder: 'Your Salesforce Client ID' },
          { key: 'client_secret', label: 'Client Secret', type: 'password',
            required: true,
            placeholder: 'Your Salesforce Client Secret' },
          { key: 'refresh_token', label: 'Refresh Token', type: 'password',
            required: true,
            placeholder: 'Your Salesforce Refresh Token' },
          { key: 'stream_name', label: 'Stream Name', type: 'text',
            required: true,
            placeholder: 'e.g., Account, Contact, Lead, etc.' },
          { key: 'start_date', label: 'Start Date', type: 'date',
            required: true,
            placeholder: 'Data sync start date' },
          { key: 'instance_url', label: 'Instance URL', type: 'text',
            required: true,
            placeholder: 'https://your-instance.salesforce.com' },
        ];
      case 'HubSpot':
        return [
          ...commonFields,
          { key: 'access_token', label: 'Access Token', type: 'password',
            required: true,
            placeholder: 'Your HubSpot Access Token' },
          { key: 'stream_name', label: 'Stream Name', type: 'text',
            required: true,
            placeholder: 'e.g., companies, contacts, deals, etc.' },
          { key: 'start_date', label: 'Start Date', type: 'date',
            required: true,
            placeholder: 'Data sync start date' },
        ];
      default:
        return [];
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];
    const fields = getSourceFields();

    if (!formData.source_name?.trim()) {
      newErrors.push({ field: 'source_name', message: 'Data Source Name is required' });
    }

    switch (selectedSource) {
      case 'Airtable':
        if (!formData.api_token?.match(/^pat[a-zA-Z0-9]{14,}$/)) {
          newErrors.push({ field: 'api_token', message: 'Invalid API token format' });
        }
        if (!formData.base_id?.match(/^app[a-zA-Z0-9]{14}$/)) {
          newErrors.push({ field: 'base_id', message: 'Invalid Base ID format' });
        }
        if (!formData.table_id) {
          newErrors.push({ field: 'table_id', message: 'Table ID is required' });
        }
        break;

      case 'Dropbox':
        if (!formData.dropbox_access_token?.startsWith('sl.')) {
          newErrors.push({ field: 'dropbox_access_token', message: 'Invalid access token format' });
        }
        if (!formData.dropbox_folder_path && !formData.dropbox_file_paths) {
          newErrors.push({ field: 'dropbox_folder_path', message: 'Either folder path or file paths must be provided' });
        }
        break;

      case 'Google Drive':
        if (!formData.file_ids?.trim()) {
          newErrors.push({ field: 'file_ids', message: 'At least one file ID is required' });
        } else {
          const fileIds = formData.file_ids.split('\n').map((id: string) => id.trim());
          
          // More strict validation for Google Drive file IDs
          fileIds.forEach((id: string, index: number) => {
            if (!id.match(/^[a-zA-Z0-9_-]{20,}$/)) {
              newErrors.push({ 
                field: 'file_ids', 
                message: `Invalid Google Drive file ID format on line ${index + 1}. File IDs should be at least 20 characters long and contain only letters, numbers, underscores, and hyphens.` 
              });
            }
          });
        }
        break;

      case 'Slack':
        if (!formData.zip_file) {
          newErrors.push({ field: 'zip_file', message: 'ZIP file is required' });
        }
        if (formData.workspace_url && !formData.workspace_url.match(/^https:\/\/[a-zA-Z0-9-]+\.slack\.com$/)) {
          newErrors.push({ field: 'workspace_url', message: 'Invalid Slack workspace URL' });
        }
        break;

      case 'Sharepoint':
        if (!formData.tenant_name) {
          newErrors.push({ field: 'tenant_name', message: 'Tenant name is required' });
        }
        if (!formData.collection_id) {
          newErrors.push({ field: 'collection_id', message: 'Collection ID is required' });
        }
        if (!formData.subsite_id) {
          newErrors.push({ field: 'subsite_id', message: 'Subsite ID is required' });
        }
        break;

      case 'GitHub':
        if (!formData.access_token?.match(/^ghp_[a-zA-Z0-9]{36}$/)) {
          newErrors.push({ field: 'access_token', message: 'Invalid GitHub access token format' });
        }
        if (!formData.repo?.match(/^[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+$/)) {
          newErrors.push({ field: 'repo', message: 'Invalid repository format. Should be owner/repo-name' });
        }
        break;

      case 'Web Scraper':
        if (formData.urls) {
          const urlList = formData.urls.split('\n');
          urlList.forEach((url: string, index: number) => {
            try {
              new URL(url.trim());
            } catch {
              newErrors.push({ field: 'urls', message: `Invalid URL on line ${index + 1}` });
            }
          });
        } else {
          newErrors.push({ field: 'urls', message: 'At least one URL is required' });
        }
        break;

      case 'Snowflake':
        const requiredFields = ['query', 'user', 'password', 'account', 'warehouse', 'role', 'database', 'schema'];
        requiredFields.forEach(field => {
          if (!formData[field]) {
            newErrors.push({ field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` });
          }
        });
        break;

      case 'Upload Files':
        const files = formData.files as File[];
        if (files?.some(file => file.size > 20 * 1024 * 1024)) {
          newErrors.push({ field: 'files', message: 'One or more files exceed 20MB limit' });
        }
        break;

      case 'Salesforce':
        if (!formData.client_id) {
          newErrors.push({ field: 'client_id', message: 'Client ID is required' });
        }
        if (!formData.client_secret) {
          newErrors.push({ field: 'client_secret', message: 'Client Secret is required' });
        }
        if (!formData.refresh_token) {
          newErrors.push({ field: 'refresh_token', message: 'Refresh Token is required' });
        }
        if (!formData.stream_name) {
          newErrors.push({ field: 'stream_name', message: 'Stream Name is required' });
        }
        if (!formData.start_date) {
          newErrors.push({ field: 'start_date', message: 'Start Date is required' });
        }
        if (!formData.instance_url) {
          newErrors.push({ field: 'instance_url', message: 'Instance URL is required' });
        }
        break;

      case 'HubSpot':
        if (!formData.access_token) {
          newErrors.push({ field: 'access_token', message: 'Access Token is required' });
        }
        if (!formData.stream_name) {
          newErrors.push({ field: 'stream_name', message: 'Stream Name is required' });
        }
        if (!formData.start_date) {
          newErrors.push({ field: 'start_date', message: 'Start Date is required' });
        }
        break;
    }

    fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors.push({ field: field.key, message: `${field.label} is required` });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setUploadStatus('uploading');

      try {
        if (selectedSource === 'Upload Files') {
          const files = formData.files as File[];
          const uploadedSources = [];

          for (const file of files) {
            const fileFormData = new FormData();
            fileFormData.append('file', file);
            fileFormData.append('name', formData.source_name || file.name);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources/upload`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session?.user?.accessToken}`
              },
              body: fileFormData
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || `Failed to upload file: ${file.name}`);
            }

            const result = await response.json();
            uploadedSources.push(result);
          }

          setUploadStatus('success');
          window.dispatchEvent(new Event('sourceAdded'));
          setTimeout(() => onClose(), 1000);
          return;
        }

        if (selectedSource === 'Google Drive') {
          const fileFormData = new FormData();
          fileFormData.append('data_source_name', formData.source_name);
          
          // Convert file_ids from textarea to array and validate format
          const fileIds = formData.file_ids
            .split('\n')
            .map((id: string) => id.trim())
            .filter((id: string) => id);

          // Basic validation before sending to server
          if (fileIds.length === 0) {
            throw new Error('At least one file ID is required');
          }

          // Check for valid Google Drive file ID format
          const invalidIds = fileIds.filter((id: string) => !id.match(/^[a-zA-Z0-9_-]{20,}$/));
          if (invalidIds.length > 0) {
            throw new Error(`Invalid file ID format: ${invalidIds.join(', ')}`);
          }

          // Send each file ID as a separate form field
          fileIds.forEach((id, index) => {
            fileFormData.append(`file_ids`, id);
          });

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources/google-drive`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.user?.accessToken}`
            },
            body: fileFormData
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to connect Google Drive data source');
          }

          const result = await response.json();
          
          // Display success with file info if available
          if (result.connection_settings?.file_metadata) {
            const fileCount = result.connection_settings.file_metadata.length;
            const totalSize = result.connection_settings.file_size;
            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
            console.log(`Successfully connected ${fileCount} files (${sizeInMB} MB)`);
          }

          setUploadStatus('success');
          window.dispatchEvent(new Event('sourceAdded'));
          setTimeout(() => onClose(), 1000);
          return;
        }

        if (selectedSource === 'Slack' || selectedSource === 'Upload Files' || 
            selectedSource === 'Dropbox' || selectedSource === 'One Drive' || 
            selectedSource === 'Sharepoint') {
          const fileFormData = new FormData();
          
          // Add source-specific fields
          if (selectedSource === 'Slack') {
            if (!formData.zip_file?.[0]) {
              throw new Error('Slack export ZIP file is required');
            }
            fileFormData.append('file', formData.zip_file[0]);
            fileFormData.append('workspace_url', formData.workspace_url);
            fileFormData.append('data_source_name', formData.source_name);
          } else if (selectedSource === 'Dropbox') {
            fileFormData.append('name', formData.source_name);
            fileFormData.append('access_token', formData.dropbox_access_token);
            fileFormData.append('recursive', String(Boolean(formData.recursive)));
          } else if (selectedSource === 'One Drive') {
            fileFormData.append('name', formData.source_name);
            fileFormData.append('client_id', formData.client_id);
            fileFormData.append('client_secret', formData.client_secret);
            fileFormData.append('recursive', String(Boolean(formData.recursive)));
          } else if (selectedSource === 'Sharepoint') {
            fileFormData.append('name', formData.source_name);
            fileFormData.append('tenant_name', formData.tenant_name);
            fileFormData.append('collection_id', formData.collection_id);
            fileFormData.append('subsite_id', formData.subsite_id);
          } else if (selectedSource === 'Upload Files') {
            fileFormData.append('name', formData.source_name);
            const files = formData.files as File[];
            if (!files?.length) {
              throw new Error('At least one file is required');
            }
            files.forEach((file, index) => {
              fileFormData.append(`file_${index}`, file);
            });
            fileFormData.append('file_count', String(files.length));
          }

          const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/data-sources/${selectedSource?.toLowerCase().replace(' ', '-')}`;
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session?.user?.accessToken}`
              },
              body: fileFormData
            });

            if (!response.ok) {
              const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to connect ${selectedSource} data source`);
            }

            const result = await response.json();
          setUploadStatus('success');
          window.dispatchEvent(new Event('sourceAdded'));
          setTimeout(() => onClose(), 1000);
          return;
        }

        if (selectedSource === 'Salesforce') {
          const salesforceConfig = {
            name: formData.source_name,
            source_type: 'salesforce',
            connection_settings: {
              client_id: formData.client_id,
              client_secret: formData.client_secret,
              refresh_token: formData.refresh_token,
              stream_name: formData.stream_name,
              start_date: formData.start_date,
              instance_url: formData.instance_url
            }
          };

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources/salesforce`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user?.accessToken}`
            },
            body: JSON.stringify(salesforceConfig)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to connect Salesforce data source');
          }

          const result = await response.json();
          setUploadStatus('success');
          window.dispatchEvent(new Event('sourceAdded'));
          setTimeout(() => onClose(), 1000);
          return;
        }

        if (selectedSource === 'HubSpot') {
          const hubspotConfig = {
            name: formData.source_name,
            source_type: 'hubspot',
            connection_settings: {
              access_token: formData.access_token,
              stream_name: formData.stream_name,
              start_date: formData.start_date
            }
          };

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources/hubspot`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user?.accessToken}`
            },
            body: JSON.stringify(hubspotConfig)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to connect HubSpot data source');
          }

          const result = await response.json();
          setUploadStatus('success');
          window.dispatchEvent(new Event('sourceAdded'));
          setTimeout(() => onClose(), 1000);
          return;
        }

        // Handle other data sources that don't use file upload
        const dataSourcePayload = {
          name: formData.source_name || selectedSource,
          source_type: (selectedSource ?? '').toLowerCase().replace(' ', '_'),
          connection_settings: {}
        };

        const connectionSettings: Record<string, any> = {};
        const fields = getSourceFields();
        
        fields.forEach(field => {
          if (field.key !== 'source_name' && formData[field.key] !== undefined) {
            connectionSettings[field.key] = formData[field.key];
          }
        });

        dataSourcePayload.connection_settings = connectionSettings;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`
          },
          body: JSON.stringify(dataSourcePayload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to connect data source');
        }

        setUploadStatus('success');
        window.dispatchEvent(new Event('sourceAdded'));
        setTimeout(() => onClose(), 1000);

      } catch (error) {
        console.error('Error connecting data source:', error);
        setErrors([{ 
          field: 'general', 
          message: error instanceof Error ? error.message : 'An error occurred while connecting the data source'
        }]);
        setUploadStatus('idle');
      }
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (key: string, files: File[]) => {
    setUploadStatus('uploading');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setFormData(prev => ({ ...prev, [key]: files }));
    setUploadStatus('success');
  };

  const getFieldError = (fieldKey: string) => {
    return errors.find(error => error.field === fieldKey)?.message;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to {selectedSource}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {getSourceFields().map(field => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.key}
                  className={`w-full min-h-[100px] px-3 py-2 border rounded-md ${
                    getFieldError(field.key) ? 'border-red-500' : ''
                  }`}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              ) : field.type === 'file' ? (
                <div className="relative">
                  <Input
                    id={field.key}
                    type="file"
                    multiple={field.multiple}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleFileChange(field.key, files);
                    }}
                    required={field.required !== false}
                    accept={field.accept}
                    className={getFieldError(field.key) ? 'border-red-500' : ''}
                  />
                  {uploadStatus === 'uploading' && (
                    <RefreshCw className="h-4 w-4 text-blue-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                  {uploadStatus === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={Boolean(formData[field.key])}
                    onCheckedChange={(checked) => handleInputChange(field.key, checked)}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <Label htmlFor={field.key} className="text-sm font-normal">
                    {field.label}
                  </Label>
                </div>
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  required={field.required !== false}
                  placeholder={field.placeholder}
                  className={getFieldError(field.key) ? 'border-red-500' : ''}
                />
              )}
              {getFieldError(field.key) && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{getFieldError(field.key)}</span>
                </div>
              )}
            </div>
          ))}
          {getFieldError('general') && (
            <div className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('general')}</span>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Connect</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
