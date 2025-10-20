
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getUserInstances, uploadPdfToKnowledgeBase } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Instance } from '@/lib/types';
import { Loader2, UploadCloud, FileText, X, CheckCircle, AlertTriangle, Database } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const statusConfig = {
    connected: { bgColor: 'bg-green-500' },
    disconnected: { bgColor: 'bg-red-500' },
    pending: { bgColor: 'bg-yellow-500' },
    pending_qr: { bgColor: 'bg-yellow-500' },
    reconnecting: { bgColor: 'bg-yellow-500' },
    error: { bgColor: 'bg-destructive' },
};

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadingFile {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
}

export default function KnowledgePage() {
  const { user } = useAuth();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { toast } = useToast();

  const fetchInstances = useCallback(async () => {
    setLoadingInstances(true);
    try {
      const fetchedInstances = await getUserInstances();
      setInstances(fetchedInstances);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar as instâncias.',
      });
    } finally {
      setLoadingInstances(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!selectedInstance) {
      toast({
        variant: 'destructive',
        title: 'Nenhuma instância selecionada',
        description: 'Por favor, selecione uma instância antes de enviar arquivos.',
      });
      return;
    }

    const newFiles: UploadingFile[] = acceptedFiles
      .filter(file => file.type === 'application/pdf')
      .map(file => ({ file, status: 'pending', progress: 0 }));
    
    setUploadingFiles(prev => [...prev, ...newFiles]);

  }, [selectedInstance, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    disabled: !selectedInstance,
  });

  const handleUpload = async () => {
    if (!user || !selectedInstance) return;

    const filesToUpload = uploadingFiles.filter(f => f.status === 'pending');
    if(filesToUpload.length === 0) return;

    filesToUpload.forEach(async (uploadingFile) => {
        setUploadingFiles(prev => prev.map(f => f.file === uploadingFile.file ? { ...f, status: 'uploading', progress: 0 } : f));
        
        try {
            // This is a placeholder for progress simulation
            // Real progress requires server-side events or a different API design
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                 setUploadingFiles(prev => prev.map(f => f.file === uploadingFile.file ? { ...f, progress: Math.min(progress, 90) } : f));
                if(progress >= 90) clearInterval(interval);
            }, 200);

            await uploadPdfToKnowledgeBase(selectedInstance, user.id, uploadingFile.file);

            clearInterval(interval);
            setUploadingFiles(prev => prev.map(f => f.file === uploadingFile.file ? { ...f, status: 'success', progress: 100 } : f));
            toast({ title: 'Sucesso!', description: `Arquivo "${uploadingFile.file.name}" enviado com sucesso.`})

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Falha no envio.';
            setUploadingFiles(prev => prev.map(f => f.file === uploadingFile.file ? { ...f, status: 'error', error: errorMessage } : f));
            toast({ variant: 'destructive', title: 'Erro de Upload', description: `Não foi possível enviar o arquivo "${uploadingFile.file.name}": ${errorMessage}`})
        }
    })
  };

  const removeFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  }

  const renderFileStatusIcon = (status: UploadStatus) => {
    switch(status) {
        case 'uploading': return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
        case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'error': return <AlertTriangle className="h-5 w-5 text-destructive" />;
        default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Base de Conhecimento</CardTitle>
          <CardDescription>
            Faça upload de documentos PDF para que seus agentes possam usá-los como fonte de conhecimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedInstance} disabled={loadingInstances || instances.length === 0}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue
                placeholder={
                  loadingInstances
                    ? 'Carregando instâncias...'
                    : instances.length === 0
                    ? 'Nenhuma instância encontrada'
                    : 'Selecione uma instância'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {instances.map((instance) => {
                 const status = instance.status?.toLowerCase() as keyof typeof statusConfig | undefined;
                 const colorClass = status ? statusConfig[status]?.bgColor : 'bg-muted-foreground';
                 return (
                    <SelectItem key={instance.id} value={instance.id}>
                        <div className="flex items-center gap-2">
                            <div className={cn('h-2 w-2 rounded-full', colorClass)} />
                            <span>{instance.name}</span>
                        </div>
                    </SelectItem>
                 )
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Upload de Arquivos</CardTitle>
                <CardDescription>Selecione ou arraste arquivos PDF para a área abaixo.</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
                        isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
                        !selectedInstance && 'cursor-not-allowed opacity-50'
                    )}
                    >
                    <input {...getInputProps()} />
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                        {isDragActive ? 'Solte os arquivos aqui...' : 'Arraste e solte arquivos aqui, ou clique para selecionar'}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>Apenas arquivos .pdf são permitidos</p>
                </div>

                {uploadingFiles.length > 0 && (
                    <div className="mt-6 space-y-4">
                        <h4 className="font-semibold">Arquivos para Enviar:</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {uploadingFiles.map(({ file, status, progress, error }, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-2 rounded-md border bg-muted/50">
                                    <div className="shrink-0">{renderFileStatusIcon(status)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        {status === 'uploading' && <Progress value={progress} className="h-1.5 mt-1" />}
                                        {status === 'error' && <p className="text-xs text-destructive">{error}</p>}
                                        {status !== 'uploading' && <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(file)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                         <Button onClick={handleUpload} disabled={!uploadingFiles.some(f => f.status === 'pending')} className="w-full">
                            <UploadCloud className="mr-2 h-4 w-4" />
                           {uploadingFiles.some(f => f.status === 'uploading') ? 'Enviando...' : `Enviar ${uploadingFiles.filter(f => f.status === 'pending').length} Arquivo(s)`}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Documentos na Base de Conhecimento</CardTitle>
                <CardDescription>Lista de documentos PDF já disponíveis para esta instância.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
                    <Database className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum documento encontrado</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Faça upload de PDFs para começar a construir sua base de conhecimento.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
