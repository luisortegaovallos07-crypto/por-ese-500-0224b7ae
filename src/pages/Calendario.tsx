import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockEventos } from '@/data/mockData';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const getEventColor = (tipo: string) => {
  switch (tipo) {
    case 'simulacro': return 'bg-primary text-primary-foreground';
    case 'taller': return 'bg-success text-success-foreground';
    case 'entrega': return 'bg-warning text-warning-foreground';
    case 'examen': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const Calendario: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-02-01'));
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockEventos.filter(e => e.fecha === dateStr);
  };
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const upcomingEvents = mockEventos
    .filter(e => new Date(e.fecha) >= new Date('2026-01-20'))
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="section-title">Calendario Académico 2026</h1>
          <p className="text-muted-foreground">Eventos, simulacros y fechas importantes.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft /></Button>
              <CardTitle>{monthNames[month]} {year}</CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight /></Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(d => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const events = day ? getEventsForDay(day) : [];
                  return (
                    <div key={i} className={`min-h-16 p-1 rounded-lg border ${day ? 'border-border hover:bg-muted/50' : 'border-transparent'} transition-colors`}>
                      {day && (
                        <>
                          <span className="text-sm font-medium">{day}</span>
                          <div className="space-y-0.5 mt-1">
                            {events.slice(0, 2).map(e => (
                              <div key={e.id} className={`text-xs px-1 py-0.5 rounded truncate ${getEventColor(e.tipo)}`}>
                                {e.titulo.substring(0, 10)}...
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CalIcon className="h-5 w-5" />Próximos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map(e => (
                <div key={e.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm line-clamp-1">{e.titulo}</span>
                    <Badge className={getEventColor(e.tipo)}>{e.tipo}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CalIcon className="h-3 w-3" />{new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{e.hora}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Calendario;
