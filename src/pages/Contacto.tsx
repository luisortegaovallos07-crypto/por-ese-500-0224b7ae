import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import './Contacto.css';

const Contacto: React.FC = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Mensaje enviado', description: 'Nos pondremos en contacto pronto.' });
    setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="section-title">Contacto</h1>
          <p className="text-muted-foreground">¿Tienes preguntas? Estamos aquí para ayudarte.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader><CardTitle>Envíanos un mensaje</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
                </div>
                <div>
                  <Label>Correo</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div>
                  <Label>Asunto</Label>
                  <Input value={form.asunto} onChange={e => setForm({...form, asunto: e.target.value})} required />
                </div>
                <div>
                  <Label>Mensaje</Label>
                  <Textarea value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})} rows={4} required />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Enviar
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">porese500@porese500.com</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">3182456525</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Ubicación</p>
                  <p className="text-sm text-muted-foreground">Aguachica, Cesar, Colombia</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contacto;
