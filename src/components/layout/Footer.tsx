import React from 'react';
import { Link } from 'react-router-dom';
import logoMain from '@/assets/logo-main.jpeg';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  const currentYear = 2026;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Logo and Description */}
          <div className="footer-brand">
            <img
              src={logoMain}
              alt="POR ESE 500"
              className="footer-logo"
            />
            <p className="footer-tagline">
              "Donde cada día de disciplina acerca los sueños al 500"
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4 className="footer-title">Enlaces Rápidos</h4>
            <ul className="footer-list">
              <li>
                <Link to="/simulacros" className="footer-link">
                  Simulacros
                </Link>
              </li>
              <li>
                <Link to="/material" className="footer-link">
                  Material de Estudio
                </Link>
              </li>
              <li>
                <Link to="/calendario" className="footer-link">
                  Calendario Académico
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="footer-link">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h4 className="footer-title">Contacto</h4>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <Mail className="footer-contact-icon" />
                porese500@porese500.com
              </li>
              <li className="footer-contact-item">
                <Phone className="footer-contact-icon" />
                3182456525
              </li>
              <li className="footer-contact-item">
                <MapPin className="footer-contact-icon" />
                Aguachica, Cesar, Colombia
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} POR ESE 500. Todos los derechos reservados.
          </p>
          <p className="footer-credits">
            Desarrollado por <span className="footer-author">Ing. de Sistemas Daniel Ortega</span>
          </p>
          <div className="footer-legal">
            <Link to="#" className="footer-legal-link">
              Política de Privacidad
            </Link>
            <Link to="#" className="footer-legal-link">
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
