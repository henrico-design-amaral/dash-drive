export type RideRecord = {
  id: string;
  date: string;
  platform: 'Uber' | '99';
  category: string;
  start: string;
  durationMin?: number;
  value: number;
  distanceKm?: number;
  origin: string;
  destination: string;
  originRegion: string;
  destinationRegion: string;
  tip?: number;
  toll?: number;
  surge?: number;
  status: 'completed' | 'cancelled-paid' | 'cancelled-unpaid';
};

export const rides: RideRecord[] = [
  { id:'u-0308-0422',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'04:22',value:3.02,origin:'Rua Shigueki Kadumoto, Taboão da Serra',destination:'Rua Shigueki Kadumoto, Taboão da Serra',originRegion:'Taboão da Serra',destinationRegion:'Taboão da Serra',status:'cancelled-paid' },
  { id:'u-0308-0432',date:'2026-08-03',platform:'Uber',category:'Prioridade',start:'04:32',durationMin:5.85,value:12.41,distanceKm:3.16,origin:'Av. Intercap, Taboão da Serra',destination:'Av. Intercap, Taboão da Serra',originRegion:'Taboão da Serra',destinationRegion:'Taboão da Serra',status:'completed' },
  { id:'u-0308-0435',date:'2026-08-03',platform:'Uber',category:'Prioridade',start:'04:35',value:0,origin:'Av. Intercap, Taboão da Serra',destination:'Av. Intercap, Taboão da Serra',originRegion:'Taboão da Serra',destinationRegion:'Taboão da Serra',status:'cancelled-unpaid' },
  { id:'u-0308-0444',date:'2026-08-03',platform:'Uber',category:'Prioridade',start:'04:44',durationMin:6.72,value:11.22,distanceKm:2.69,origin:'Rua Apóstolo Thiago, Osasco',destination:'Rua Mário Regallo Pereira, Butantã',originRegion:'Osasco',destinationRegion:'Butantã',status:'completed' },
  { id:'u-0308-0500',date:'2026-08-03',platform:'Uber',category:'Prioridade',start:'05:00',durationMin:9.63,value:13.19,distanceKm:4.71,origin:'Rua Isaías Fontes, Raposo Tavares',destination:'Rua João Moreira Salles, Jardim Rosa Maria',originRegion:'Raposo Tavares',destinationRegion:'Jardim Rosa Maria',status:'completed' },
  { id:'u-0308-0524',date:'2026-08-03',platform:'Uber',category:'Prioridade',start:'05:24',durationMin:5.45,value:13.42,distanceKm:2.34,origin:'Rua Orlando Fernando Gabriel da Costa, Taboão da Serra',destination:'Av. Eng. Heitor Eiras Garcia, Jardim João XXIII',originRegion:'Taboão da Serra',destinationRegion:'Jardim João XXIII',tip:3,status:'completed' },
  { id:'u-0308-0600',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'06:00',durationMin:50.95,value:43.79,distanceKm:18.57,origin:'Rua Preciosa, Taboão da Serra',destination:'Av. Santa Catarina, Vila Mascote',originRegion:'Taboão da Serra',destinationRegion:'Vila Mascote',status:'completed' },
  { id:'u-0308-0700',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'07:00',durationMin:38.73,value:29.16,distanceKm:11.38,origin:'Rua Porto Castanheiro, Jabaquara',destination:'Rua Inco, Diadema',originRegion:'Jabaquara',destinationRegion:'Diadema',status:'completed' },
  { id:'u-0308-0726',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'07:26',durationMin:72,value:52.76,distanceKm:25.88,origin:'Av. Fundibem, Diadema',destination:'Rua Alexandre Dumas, Chácara Santo Antônio',originRegion:'Diadema',destinationRegion:'Chácara Santo Antônio',surge:4.5,status:'completed' },
  { id:'u-0308-0858',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'08:58',value:0,origin:'Rua da Paz, Santo Amaro',destination:'Rua da Paz, Santo Amaro',originRegion:'Santo Amaro',destinationRegion:'Santo Amaro',status:'cancelled-unpaid' },
  { id:'u-0308-0902',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'09:02',durationMin:38.87,value:25.95,distanceKm:6.34,origin:'Rua Cap. Otavio Machado, Santo Amaro',destination:'Av. Brig. Faria Lima, Itaim Bibi',originRegion:'Santo Amaro',destinationRegion:'Itaim Bibi',surge:3,status:'completed' },
  { id:'u-0308-1005',date:'2026-08-03',platform:'Uber',category:'Uber Pet',start:'10:05',durationMin:17.92,value:17.36,distanceKm:4.16,origin:'Rua Fernandes de Abreu, Itaim Bibi',destination:'R. Estados Unidos, Jardim América',originRegion:'Itaim Bibi',destinationRegion:'Jardim América',status:'completed' },
  { id:'u-0308-1040',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'10:40',durationMin:20.57,value:17.69,distanceKm:7.54,origin:'Rua Catequese, Butantã',destination:'Av. General Cavalcanti de Albuquerque, Vila Sônia',originRegion:'Butantã',destinationRegion:'Vila Sônia',status:'completed' },
  { id:'u-0308-1128',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'11:28',durationMin:12.2,value:11.63,distanceKm:3.68,origin:'R. Dr. Luiz Migliano, Jardim Caboré',destination:'Rua José Maciel Neto, Taboão da Serra',originRegion:'Jardim Caboré',destinationRegion:'Taboão da Serra',status:'completed' },
  { id:'u-0308-1145',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'11:45',durationMin:4.6,value:5.7,distanceKm:1.76,origin:'Estr. São Francisco, Taboão da Serra',destination:'Rua Pedra Cavalheiro da Silva, Taboão da Serra',originRegion:'Taboão da Serra',destinationRegion:'Taboão da Serra',status:'completed' },
  { id:'u-0308-1147',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'11:47',durationMin:6.73,value:6.74,distanceKm:1.35,origin:'Rua Vicente Pereira, Taboão da Serra',destination:'R. Vicente Pereira, Parque Marabá',originRegion:'Taboão da Serra',destinationRegion:'Taboão da Serra',status:'completed' },
  { id:'u-0308-1242',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'12:42',durationMin:29.03,value:15.98,distanceKm:7.43,origin:'Av. Dr. Guilherme Dumont Vilares, Vila Andrade',destination:'Rua Carlos Nahas, Campo Limpo',originRegion:'Vila Andrade',destinationRegion:'Campo Limpo',status:'completed' },
  { id:'u-0308-1248',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'12:48',durationMin:5.78,value:9.15,distanceKm:1.17,origin:'Rua do Símbolo, Vila Andrade',destination:'Av. Giovanni Gronchi, Vila Andrade',originRegion:'Vila Andrade',destinationRegion:'Vila Andrade',status:'completed' },
  { id:'u-0308-1328',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'13:28',durationMin:23.15,value:13.58,distanceKm:5.42,origin:'Rua Tomás de Araújo, Campo Limpo',destination:'Rua Geraldo Fraga de Oliveira, Jardim São Luís',originRegion:'Campo Limpo',destinationRegion:'Jardim São Luís',status:'completed' },
  { id:'u-0308-1401',date:'2026-08-03',platform:'Uber',category:'Uber X',start:'14:01',durationMin:24.77,value:19.22,distanceKm:8.78,origin:'R. Vicente Decara Neto, Jardim Santo Antônio',destination:'Av. Pirajussara, Instituto de Previdência',originRegion:'Jardim Santo Antônio',destinationRegion:'Instituto de Previdência',status:'completed' },
  { id:'u-0408-1330',date:'2026-08-04',platform:'Uber',category:'Prioridade',start:'13:30',durationMin:3.52,value:7.32,distanceKm:2.07,origin:'Rua Manoel Gonçalves, Taboão da Serra',destination:'Av. Vida Nova, Jardim Maria Rosa',originRegion:'Taboão da Serra',destinationRegion:'Taboão da Serra',status:'completed' },
  { id:'u-0408-1337',date:'2026-08-04',platform:'Uber',category:'Uber X',start:'13:37',durationMin:29.83,value:22.15,distanceKm:10.69,origin:'R. José Maciel Neto, Taboão da Serra',destination:'Marginal Rodovia Raposo Tavares, Cotia',originRegion:'Taboão da Serra',destinationRegion:'Cotia',status:'completed' },
  { id:'u-0408-1410',date:'2026-08-04',platform:'Uber',category:'Prioridade',start:'14:10',durationMin:5.25,value:9.72,distanceKm:1.97,origin:'R. Riacho, Jardim Guerreiro, Cotia',destination:'Rua Comendador Carmine Lourenço Del Gaizo, Cotia',originRegion:'Cotia',destinationRegion:'Cotia',status:'completed' },
  { id:'u-0408-1428',date:'2026-08-04',platform:'Uber',category:'Uber X',start:'14:28',durationMin:16.7,value:19.84,distanceKm:7.64,origin:'Via de Acesso Arterial Sul, São Paulo',destination:'R. Associação Portuguesa de Desportos, Osasco',originRegion:'São Paulo',destinationRegion:'Osasco',status:'completed' },
  { id:'u-0408-1447',date:'2026-08-04',platform:'Uber',category:'Uber X',start:'14:47',durationMin:3.32,value:5.91,distanceKm:1,origin:'Rua Treze de Setembro, Jaguaribe, Osasco',destination:'Rua Circular, Santo Antônio, Osasco',originRegion:'Osasco',destinationRegion:'Osasco',status:'completed' },
  { id:'u-0408-1457',date:'2026-08-04',platform:'Uber',category:'Uber X',start:'14:57',durationMin:12.58,value:9.31,distanceKm:3.99,origin:'Rua Circular, Santo Antônio, Osasco',destination:'Rua Alberto Filipini, Umuarama, Osasco',originRegion:'Osasco',destinationRegion:'Osasco',status:'completed' },
  { id:'u-0408-1512',date:'2026-08-04',platform:'Uber',category:'Uber X',start:'15:12',durationMin:116,value:64.2,distanceKm:32.85,origin:'Av. Pref. Hirant Sanazar, Osasco',destination:'Av. Prof. Luiz Ignácio Anhaia Mello, São Lucas',originRegion:'Osasco',destinationRegion:'São Lucas',status:'completed' },
  { id:'u-0408-1709',date:'2026-08-04',platform:'Uber',category:'Uber X',start:'17:09',durationMin:39.83,value:31.36,distanceKm:17.79,origin:'Rua Jabiaçu, São Lucas',destination:'Rua Tacuré, Jaçanã',originRegion:'São Lucas',destinationRegion:'Jaçanã',toll:2.69,status:'completed' },
  { id:'u-0408-1803',date:'2026-08-04',platform:'Uber',category:'Prioridade',start:'18:03',durationMin:20.22,value:25.37,distanceKm:14.81,origin:'Rua Artur Roberto, Jaçanã',destination:'R. Eng. Franco Zampari, Casa Verde',originRegion:'Jaçanã',destinationRegion:'Casa Verde',toll:4.06,status:'completed' },
  { id:'u-0408-1825',date:'2026-08-04',platform:'Uber',category:'Uber X',start:'18:25',durationMin:49.88,value:39.03,distanceKm:12.55,origin:'Av. Braz Leme, Santana',destination:'Rua Vergueiro, Vila Mariana',originRegion:'Santana',destinationRegion:'Vila Mariana',surge:7.25,status:'completed' },
  { id:'u-0408-1921',date:'2026-08-04',platform:'Uber',category:'Prioridade',start:'19:21',durationMin:37.2,value:34.01,distanceKm:6.53,origin:'Rua Madre Cabrini, Vila Mariana',destination:'Rua Santo Antônio, República',originRegion:'Vila Mariana',destinationRegion:'República',status:'completed' },
  { id:'99-0408-2009',date:'2026-08-04',platform:'99',category:'Negocia',start:'20:09',value:16.43,origin:'Rua Maestro Cardim, Liberdade',destination:'Planalto Paulista',originRegion:'Liberdade',destinationRegion:'Planalto Paulista',status:'completed' },
  { id:'99-0408-2050',date:'2026-08-04',platform:'99',category:'Negocia',start:'20:50',value:15.15,origin:'Rua Anésio Pinto Rosa, Itaim Bibi',destination:'Rua Sapetuba, Butantã',originRegion:'Itaim Bibi',destinationRegion:'Butantã',status:'completed' },
  { id:'u-0408-2113',date:'2026-08-04',platform:'Uber',category:'Uber X',start:'21:13',durationMin:25.3,value:22.04,distanceKm:11.14,origin:'R. dos Três Irmãos, Morumbi',destination:'Rua José Bueno, Taboão da Serra',originRegion:'Morumbi',destinationRegion:'Taboão da Serra',status:'completed' }
];

const completed = rides.filter((ride) => ride.status === 'completed');
const withDistance = completed.filter((ride) => ride.distanceKm && ride.distanceKm > 0);
const withDuration = completed.filter((ride) => ride.durationMin && ride.durationMin > 0);

const by = <T extends string>(key: (ride: RideRecord) => T) =>
  Object.values(completed.reduce<Record<string, { key: string; rides: number; revenue: number; distanceKm: number; durationMin: number }>>((acc, ride) => {
    const value = key(ride);
    const item = acc[value] ?? { key: value, rides: 0, revenue: 0, distanceKm: 0, durationMin: 0 };
    item.rides += 1;
    item.revenue += ride.value;
    item.distanceKm += ride.distanceKm ?? 0;
    item.durationMin += ride.durationMin ?? 0;
    acc[value] = item;
    return acc;
  }, {})).map((item) => ({
    ...item,
    ticketAverage: item.revenue / item.rides,
    revenuePerKm: item.distanceKm ? item.revenue / item.distanceKm : null,
    revenuePerHour: item.durationMin ? item.revenue / (item.durationMin / 60) : null
  }));

const hourBand = (start: string) => {
  const hour = Number(start.slice(0, 2));
  const from = Math.floor(hour / 2) * 2;
  return `${String(from).padStart(2, '0')}h–${String(from + 2).padStart(2, '0')}h`;
};

export const rideIntelligence = {
  sample: {
    totalRecords: rides.length,
    completed: completed.length,
    cancellations: rides.length - completed.length,
    dates: ['2026-08-03', '2026-08-04'],
    knownDistanceRides: withDistance.length,
    knownDurationRides: withDuration.length
  },
  totals: {
    revenue: completed.reduce((sum, ride) => sum + ride.value, 0),
    paidDistanceKm: withDistance.reduce((sum, ride) => sum + (ride.distanceKm ?? 0), 0),
    rideMinutes: withDuration.reduce((sum, ride) => sum + (ride.durationMin ?? 0), 0),
    tips: completed.reduce((sum, ride) => sum + (ride.tip ?? 0), 0),
    tolls: completed.reduce((sum, ride) => sum + (ride.toll ?? 0), 0),
    surge: completed.reduce((sum, ride) => sum + (ride.surge ?? 0), 0)
  },
  byOriginRegion: by((ride) => ride.originRegion).sort((a, b) => b.revenue - a.revenue),
  byDestinationRegion: by((ride) => ride.destinationRegion).sort((a, b) => b.revenue - a.revenue),
  byCategory: by((ride) => ride.category).sort((a, b) => b.revenue - a.revenue),
  byHourBand: by((ride) => hourBand(ride.start)).sort((a, b) => a.key.localeCompare(b.key)),
  longRides: completed.filter((ride) => (ride.distanceKm ?? 0) >= 15 || (ride.durationMin ?? 0) >= 45),
  lowEfficiencyCandidates: completed.filter((ride) => ride.distanceKm && ride.durationMin && (ride.value / ride.distanceKm < 1.8 || ride.value / (ride.durationMin / 60) < 30))
};
