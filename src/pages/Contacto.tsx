import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import './Contacto.css';

const Contacto: React.FC = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [sending, setSending] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulamos envío
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: 'Mensaje enviado', description: 'Nos pondremos en contacto pronto.' });
    setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
    setSending(false);
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="contacto-header">
          <h1 className="section-title">Contacto</h1>
          <p className="contacto-subtitle">¿Tienes preguntas? Estamos aquí para ayudarte.</p>
        </div>
        
        <div className="contacto-grid">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Envíanos un mensaje</h2>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} className="contacto-form">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input 
                    type="text"
                    className="input"
                    value={form.nombre} 
                    onChange={e => setForm({...form, nombre: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo</label>
                  <input 
                    type="email"
                    className="input"
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Asunto</label>
                  <input 
                    type="text"
                    className="input"
                    value={form.asunto} 
                    onChange={e => setForm({...form, asunto: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mensaje</label>
                  <textarea 
                    className="textarea"
                    value={form.mensaje} 
                    onChange={e => setForm({...form, mensaje: e.target.value})} 
                    rows={4} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="btn-icon animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="btn-icon" />
                      Enviar
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          <div className="contacto-info">
            <div className="card contacto-info-card">
              <div className="contacto-info-icon">
                <Mail />
              </div>
              <div className="contacto-info-content">
                <p className="contacto-info-title">Email</p>
                <p className="contacto-info-text">porese500@porese500.com</p>
              </div>
            </div>
            <div className="card contacto-info-card">
              <div className="contacto-info-icon">
                <Phone />
              </div>
              <div className="contacto-info-content">
                <p className="contacto-info-title">Teléfono</p>
                <p className="contacto-info-text">3182456525</p>
              </div>
            </div>
            <div className="card contacto-info-card">
              <div className="contacto-info-icon">
                <MapPin />
              </div>
              <div className="contacto-info-content">
                <p className="contacto-info-title">Ubicación</p>
                <p className="contacto-info-text">Aguachica, Cesar, Colombia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contacto;
