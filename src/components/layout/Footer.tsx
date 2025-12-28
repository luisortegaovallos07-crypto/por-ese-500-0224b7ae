import React from 'react';
import { Link } from 'react-router-dom';
import logoMain from '@/assets/logo-main.jpeg';

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
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>info@porese500.edu</li>
              <li>+57 (1) 234 5678</li>
              <li>Bogotá, Colombia</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} POR ESE 500. Todos los derechos reservados.
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
