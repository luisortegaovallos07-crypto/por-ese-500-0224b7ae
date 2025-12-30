import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Calendario: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-02-01'));
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="section-title flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            Calendario Académico 2026
          </h1>
          <p className="text-muted-foreground">Consulta las fechas importantes del programa académico.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendario principal */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">{monthNames[month]} {year}</CardTitle>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {/* Nombres de los días */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(d => (
                  <div 
                    key={d} 
                    className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wide"
                  >
                    {d}
                  </div>
                ))}
              </div>
              
              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => (
                  <div 
                    key={i} 
                    className={`
                      min-h-12 sm:min-h-16 p-2 rounded-lg border transition-colors flex items-start justify-center
                      ${day ? 'border-border hover:bg-muted/50 cursor-pointer' : 'border-transparent'}
                      ${day && isToday(day) ? 'bg-primary/10 border-primary' : ''}
                    `}
                  >
                    {day && (
                      <span className={`
                        text-sm font-medium
                        ${isToday(day) ? 'text-primary font-bold' : ''}
                      `}>
                        {day}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Panel lateral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalIcon className="h-5 w-5 text-primary" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-sm">
                  No hay eventos programados.
                </p>
                <p className="text-muted-foreground/70 text-xs mt-1">
                  Los eventos aparecerán aquí cuando sean agregados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Calendario;
