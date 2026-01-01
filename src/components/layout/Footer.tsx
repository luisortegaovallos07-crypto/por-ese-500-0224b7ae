import React from 'react';
import { Link } from 'react-router-dom';
import logoMain from '@/assets/logo-main.jpeg';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = 2026;

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="flex flex-col gap-4">
            <img
              src={logoMain}
              alt="POR ESE 500"
              className="h-16 w-auto object-contain self-start"
            />
            <p className="text-sm text-muted-foreground max-w-xs">
              "Donde cada día de disciplina acerca los sueños al 500"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/simulacros" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Simulacros
                </Link>
              </li>
              <li>
                <Link to="/material" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Material de Estudio
                </Link>
              </li>
              <li>
                <Link to="/calendario" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Calendario Académico
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contacto</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                porese500@porese500.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                3182456525
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Aguachica, Cesar, Colombia
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} POR ESE 500. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Desarrollado por <span className="text-primary font-medium">Ing. de Sistemas Daniel Ortega</span>
          </p>
          <div className="flex items-center gap-4">
            <Link to="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Política de Privacidad
            </Link>
            <Link to="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
