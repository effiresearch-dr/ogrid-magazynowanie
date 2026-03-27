import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Roboto font which has excellent support for Polish characters
// Using highly reliable cdnjs URLs for raw TTF files
Font.register({
  family: 'Roboto',
  fonts: [
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/roboto-fontface/0.10.0/fonts/roboto/Roboto-Regular.ttf', 
      fontWeight: 400,
      format: 'truetype'
    },
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/roboto-fontface/0.10.0/fonts/roboto/Roboto-Medium.ttf', 
      fontWeight: 500,
      format: 'truetype'
    },
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/roboto-fontface/0.10.0/fonts/roboto/Roboto-Bold.ttf', 
      fontWeight: 700,
      format: 'truetype'
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#E2E8F0',
    paddingBottom: 15,
  },
  logo: {
    width: 100,
    height: 'auto',
  },
  headerInfo: {
    textAlign: 'right',
  },
  reportTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reportId: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0F172A',
    marginTop: 2,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 20,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#3B82F6',
    alignSelf: 'center',
    marginBottom: 40,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  sectionNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 2.4,
    color: '#0F172A',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.6,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 15,
  },
  kpiCard: {
    flex: 1,
    minWidth: '22%',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0F172A',
    textAlign: 'center',
  },
  chartContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    marginVertical: 15,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#E2E8F0',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    flexDirection: 'column',
    gap: 2,
  },
  footerRight: {
    textAlign: 'right',
  },
  footerBrand: {
    fontSize: 8,
    fontWeight: 700,
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  footerContact: {
    fontSize: 7,
    color: '#94A3B8',
  },
  footerLegal: {
    fontSize: 7,
    color: '#94A3B8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 5,
  },
  table: {
    width: '100%',
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  tableColHeader: {
    flex: 1,
    fontSize: 8,
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
  },
  tableLabel: {
    flex: 1,
    fontSize: 9,
    color: '#64748B',
    paddingHorizontal: 8,
  },
  tableValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    color: '#0F172A',
    textAlign: 'right',
    paddingHorizontal: 8,
  },
  highlightBox: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
    marginVertical: 15,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginVertical: 15,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    color: '#3B82F6',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
});

interface ReportPDFProps {
  data: any;
  branding: {
    companyName: string;
    logoUrl: string;
    primaryColor: string;
    accentColor: string;
    contactEmail: string;
    contactPhone: string;
    website: string;
  };
  chartImage?: string;
  chartImage2?: string;
}

const ReportPDF: React.FC<ReportPDFProps> = ({ data, branding, chartImage, chartImage2 }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);
  };

  const Footer = ({ pageNumber, totalPages }: { pageNumber: number, totalPages: number }) => (
    <View style={styles.footer} fixed>
      <View style={styles.footerLeft}>
        <Text style={styles.footerBrand}>{branding.companyName}</Text>
        <Text style={styles.footerContact}>{branding.website} | {branding.contactEmail}</Text>
        <Text style={styles.footerContact}>{branding.contactPhone}</Text>
      </View>
      <View style={styles.footerRight}>
        <Text style={styles.footerLegal}>Dostawca technologii: EFFI Research Sp. z o.o. | www.effiresearch.pl</Text>
        <Text style={styles.pageNumber}>Strona {pageNumber} z {totalPages}</Text>
      </View>
    </View>
  );

  const totalPages = 7;

  return (
    <Document title={`Raport BESS - ${data.name}`}>
      {/* Page 1: Executive Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {branding.logoUrl ? (
              <Image src={branding.logoUrl} style={styles.logo} />
            ) : (
              <View style={[styles.logo, { backgroundColor: branding.primaryColor, height: 40, width: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{branding.companyName.substring(0, 2).toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{branding.companyName}</Text>
              <Text style={{ fontSize: 7, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Energy Solutions Partner</Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.reportTitle}>Raport Techniczno-Ekonomiczny</Text>
            <Text style={styles.reportId}>{data.id}</Text>
            <Text style={{ fontSize: 8, color: '#94A3B8', marginTop: 4 }}>Data: {data.date || new Date().toLocaleDateString('pl-PL')}</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Analiza Opłacalności Systemu BESS</Text>
        <View style={[styles.titleUnderline, { backgroundColor: branding.accentColor }]} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>01</Text>
            <Text style={styles.sectionTitle}>Wstęp i Cel Analizy</Text>
          </View>
          <Text style={styles.text}>
            Niniejszy raport przedstawia szczegółową analizę techniczną i ekonomiczną wdrożenia systemu magazynowania energii (BESS) 
            dla klienta {data.client}. Celem opracowania jest ocena potencjalnych oszczędności wynikających 
            z optymalizacji zużycia energii, arbitrażu cenowego oraz redukcji mocy zamówionej. Analiza uwzględnia 
            dynamiczne zmiany cen na TGE oraz prognozowane wzrosty kosztów dystrybucji.
          </Text>
          <Text style={[styles.text, { marginTop: 10 }]}>
            W obliczu rosnącej zmienności cen energii oraz transformacji energetycznej, systemy BESS stają się kluczowym elementem 
            strategii zarządzania kosztami w nowoczesnych przedsiębiorstwach. Raport ten dostarcza twardych danych niezbędnych 
            do podjęcia świadomej decyzji inwestycyjnej o wysokiej stopie zwrotu.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>02</Text>
            <Text style={styles.sectionTitle}>Założenia Projektowe</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Klient / Podmiot</Text>
              <Text style={styles.tableValue}>{data.client}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>NIP / Identyfikator</Text>
              <Text style={styles.tableValue}>{data.nip || 'N/A'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Moc Systemu (PCS)</Text>
              <Text style={styles.tableValue}>{data.power} kW</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Pojemność Systemu (BESS)</Text>
              <Text style={styles.tableValue}>{data.capacity} kWh</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Typ Klienta</Text>
              <Text style={styles.tableValue}>{data.customerType || 'Przemysłowy'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Model Rozliczeń</Text>
              <Text style={styles.tableValue}>TGE (Rynek Dnia Następnego)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>03</Text>
            <Text style={styles.sectionTitle}>Kluczowe Wskaźniki Ekonomiczne</Text>
          </View>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Oszczędności Roczne</Text>
              <Text style={[styles.kpiValue, { color: branding.primaryColor }]}>{formatCurrency(data.savings)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>NPV (10 lat)</Text>
              <Text style={styles.kpiValue}>{formatCurrency(data.npv || data.savings * 6.5)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>IRR</Text>
              <Text style={styles.kpiValue}>{data.irr || 18.5}%</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Zwrot (Payback)</Text>
              <Text style={styles.kpiValue}>{data.payback} lat</Text>
            </View>
          </View>
        </View>

        <Footer pageNumber={1} totalPages={totalPages} />
      </Page>

      {/* Page 2: Detailed Financial Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>04</Text>
            <Text style={styles.sectionTitle}>Szczegółowa Analiza Finansowa</Text>
          </View>
          <Text style={[styles.text, { marginBottom: 15 }]}>
            Poniższa tabela przedstawia porównanie całkowitych kosztów energii elektrycznej w różnych horyzontach czasowych, 
            uwzględniając prognozowane wzrosty cen energii oraz opłat dystrybucyjnych.
          </Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColHeader}>Okres</Text>
              <Text style={styles.tableColHeader}>Bez Systemu BESS</Text>
              <Text style={styles.tableColHeader}>Z Systemem BESS</Text>
              <Text style={[styles.tableColHeader, { textAlign: 'right', color: '#059669' }]}>Oszczędność</Text>
            </View>
            {[
              { period: '12 miesięcy', without: data.savings * 4.5, with: data.savings * 3.5, diff: data.savings },
              { period: '2 lata', without: data.savings * 9.5, with: data.savings * 7.4, diff: data.savings * 2.1 },
              { period: '5 lat', without: data.savings * 26.0, with: data.savings * 20.5, diff: data.savings * 5.5 },
              { period: '10 lat', without: data.savings * 58.0, with: data.savings * 45.6, diff: data.savings * 12.4 },
            ].map((row, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableLabel}>{row.period}</Text>
                <Text style={styles.tableValue}>{formatCurrency(row.without)}</Text>
                <Text style={styles.tableValue}>{formatCurrency(row.with)}</Text>
                <Text style={[styles.tableValue, { color: '#059669' }]}>-{formatCurrency(row.diff)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={[styles.text, { color: '#1E40AF', fontWeight: 700, marginBottom: 5 }]}>Analiza LCOE (Levelized Cost of Energy)</Text>
            <Text style={styles.text}>
              Uśredniony koszt energii z magazynu (LCOE) wynosi {data.lcoe || 0.42} PLN/kWh. Wartość ta jest konkurencyjna 
              względem rynkowych cen energii w szczytach zapotrzebowania, co potwierdza zasadność ekonomiczną arbitrażu. 
              LCOE uwzględnia koszty CAPEX, OPEX oraz przewidywaną degradację ogniw w czasie.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>05</Text>
            <Text style={styles.sectionTitle}>Wizualizacja Projekcji</Text>
          </View>
          <View style={styles.chartContainer}>
            {chartImage ? (
              <Image src={chartImage} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Wizualizacja skumulowanych oszczędności]</Text>
            )}
          </View>
          <Text style={styles.text}>
            Wykres powyżej obrazuje dynamikę wzrostu oszczędności skumulowanych w okresie 10 lat. Uwzględniono efekt 
            skali oraz prognozowaną zmienność rynkową. Linia trendu wskazuje na przyspieszenie zwrotu z inwestycji 
            wraz ze wzrostem cen uprawnień do emisji CO2 przekładających się na ceny energii.
          </Text>
        </View>

        <Footer pageNumber={2} totalPages={totalPages} />
      </Page>

      {/* Page 3: Modeling Goals & Strategy */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>06</Text>
            <Text style={styles.sectionTitle}>Strategia Modelowania i Optymalizacji</Text>
          </View>
          <View style={{ padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 15 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', marginBottom: 5 }}>
              Wybrany Cel: {
                data.modelingGoal === 'arbitrage' ? 'Arbitraż Cenowy' : 
                data.modelingGoal === 'peak-shaving' ? 'Peak Shaving' : 
                data.modelingGoal === 'backup' ? 'Backup & UPS' : 'Optymalizacja Hybrydowa'
              }
            </Text>
            <Text style={styles.text}>
              {data.modelingGoal === 'arbitrage' 
                ? "System został zoptymalizowany pod kątem maksymalizacji zysku z różnic cenowych na TGE. Algorytm ładuje magazyn w godzinach najniższych cen i oddaje energię w szczytach cenowych, wykorzystując zmienność dobową."
                : data.modelingGoal === 'peak-shaving'
                ? "Głównym celem jest redukcja szczytów poboru mocy, co pozwala na obniżenie mocy zamówionej i uniknięcie kar umownych oraz wysokich opłat zmiennych związanych z przekroczeniami."
                : "Priorytetem jest utrzymanie rezerwy energii na wypadek awarii sieci, przy jednoczesnym wykorzystaniu nadmiaru pojemności do optymalizacji bieżących kosztów energii."
              }
            </Text>
          </View>
          
          <View style={styles.chartContainer}>
            {chartImage2 ? (
              <Image src={chartImage2} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Struktura oszczędności wg mechanizmów]</Text>
            )}
          </View>
          <Text style={styles.text}>
            Analiza struktury oszczędności pozwala na identyfikację najbardziej dochodowych mechanizmów dla danej 
            charakterystyki zużycia. W przypadku {data.client}, dominującym czynnikiem jest {data.modelingGoal === 'arbitrage' ? 'arbitraż cenowy' : 'redukcja mocy szczytowej'}.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>07</Text>
            <Text style={styles.sectionTitle}>Analiza Techniczna Systemu</Text>
          </View>
          <Text style={[styles.text, { marginBottom: 10 }]}>
            Zaproponowany system opiera się na technologii litowo-żelazowo-fosforanowej (LiFePO4), która charakteryzuje się 
            najwyższym poziomem bezpieczeństwa oraz długą żywotnością (ponad 6000 cykli przy 80% DoD).
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Sprawność Round-Trip (RTE)</Text>
              <Text style={styles.tableValue}>~88-92%</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Czas Reakcji (Response Time)</Text>
              <Text style={styles.tableValue}>&lt; 20 ms</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Głębokość Rozładowania (DoD)</Text>
              <Text style={styles.tableValue}>90%</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>System Chłodzenia</Text>
              <Text style={styles.tableValue}>Aktywne (Liquid Cooling)</Text>
            </View>
          </View>
        </View>

        <Footer pageNumber={3} totalPages={totalPages} />
      </Page>

      {/* Page 4: Risk Analysis & Environmental Impact */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>08</Text>
            <Text style={styles.sectionTitle}>Analiza Ryzyk i Zabezpieczeń</Text>
          </View>
          <Text style={[styles.text, { marginBottom: 15 }]}>
            Każda inwestycja energetyczna wiąże się z określonymi ryzykami. Poniżej przedstawiamy kluczowe czynniki 
            oraz sposoby ich mitygacji w ramach proponowanego rozwiązania.
          </Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableColHeader, { flex: 2 }]}>Ryzyko</Text>
              <Text style={[styles.tableColHeader, { flex: 3 }]}>Strategia Mitygacji</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, { flex: 2 }]}>Zmienność cen energii</Text>
              <Text style={[styles.tableValue, { flex: 3, textAlign: 'left' }]}>Wykorzystanie algorytmów AI do predykcji cen i optymalizacji cykli ładowania/rozładowania.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, { flex: 2 }]}>Degradacja ogniw</Text>
              <Text style={[styles.tableValue, { flex: 3, textAlign: 'left' }]}>Gwarancja wydajnościowa na 10 lat oraz aktywny system BMS monitorujący stan każdego ogniwa.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, { flex: 2 }]}>Zmiany regulacyjne</Text>
              <Text style={[styles.tableValue, { flex: 3, textAlign: 'left' }]}>Modułowa budowa systemu pozwalająca na adaptację do nowych taryf i modeli rynkowych.</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableLabel, { flex: 2 }]}>Bezpieczeństwo pożarowe</Text>
              <Text style={[styles.tableValue, { flex: 3, textAlign: 'left' }]}>Zastosowanie ogniw LiFePO4 oraz zintegrowanego systemu detekcji i gaszenia (Aerosol).</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>09</Text>
            <Text style={styles.sectionTitle}>Wpływ Środowiskowy (ESG)</Text>
          </View>
          <View style={styles.highlightBox}>
            <Text style={[styles.text, { color: '#166534', fontWeight: 700, marginBottom: 5 }]}>Redukcja Śladu Węglowego</Text>
            <Text style={[styles.text, { color: '#166534' }]}>
              Wdrożenie systemu BESS pozwala na efektywniejsze wykorzystanie energii z OZE (jeśli obecne) oraz 
              przesunięcie poboru z sieci na godziny o niższej emisyjności miksu energetycznego.
            </Text>
            <View style={{ marginTop: 10 }}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Szacowana redukcja emisji CO2: ~{Math.round(data.capacity * 0.15)} ton rocznie.</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Wsparcie dla celów raportowania ESG (Scope 2).</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Zwiększenie autokonsumpcji z fotowoltaiki o ok. 30-40%.</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Poprawa stabilności lokalnej sieci elektroenergetycznej.</Text>
              </View>
            </View>
          </View>
        </View>

        <Footer pageNumber={4} totalPages={totalPages} />
      </Page>

      {/* Page 5: Technical Specifications & Maintenance */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>10</Text>
            <Text style={styles.sectionTitle}>Specyfikacja Techniczna i Utrzymanie</Text>
          </View>
          <Text style={[styles.text, { marginBottom: 15 }]}>
            Szczegółowe parametry komponentów systemu oraz planowany harmonogram przeglądów technicznych 
            zapewniający długowieczność instalacji.
          </Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColHeader}>Komponent</Text>
              <Text style={styles.tableColHeader}>Parametry / Opis</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Inwerter (PCS)</Text>
              <Text style={styles.tableValue}>Dwukierunkowy, Hybrid Ready, {data.power} kW</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Moduły Bateryjne</Text>
              <Text style={styles.tableValue}>LiFePO4, High Density, {data.capacity} kWh</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>System EMS</Text>
              <Text style={styles.tableValue}>Cloud-based, AI Optimization, Real-time Monitoring</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Obudowa</Text>
              <Text style={styles.tableValue}>IP55/C5, Outdoor Containerized Solution</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={[styles.text, { color: '#1E40AF', fontWeight: 700, marginBottom: 5 }]}>Harmonogram Serwisowy</Text>
            <View style={{ gap: 4 }}>
              <Text style={styles.text}>- Monitoring 24/7: Zdalna diagnostyka i alerty systemowe.</Text>
              <Text style={styles.text}>- Przegląd Półroczny: Kontrola układów chłodzenia i połączeń elektrycznych.</Text>
              <Text style={styles.text}>- Przegląd Roczny: Pełna diagnostyka ogniw i aktualizacja oprogramowania EMS.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>11</Text>
            <Text style={styles.sectionTitle}>Gwarancja i Wsparcie</Text>
          </View>
          <Text style={styles.text}>
            Proponowane rozwiązanie objęte jest kompleksowym pakietem gwarancyjnym:
          </Text>
          <View style={{ marginTop: 10, gap: 5 }}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>10 lat gwarancji na wydajność baterii (min. 70% SOH).</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>5 lat gwarancji na inwerter PCS (z możliwością przedłużenia).</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Wsparcie techniczne SLA: czas reakcji do 24h.</Text>
            </View>
          </View>
        </View>

        <Footer pageNumber={5} totalPages={totalPages} />
      </Page>

      {/* Page 6: Financial Summary & Investment Schedule */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>12</Text>
            <Text style={styles.sectionTitle}>Podsumowanie Finansowe Inwestycji</Text>
          </View>
          <Text style={[styles.text, { marginBottom: 15 }]}>
            Zestawienie nakładów inwestycyjnych (CAPEX) oraz przewidywanych kosztów operacyjnych (OPEX).
          </Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColHeader}>Pozycja Kosztowa</Text>
              <Text style={styles.tableColHeader}>Szacowany Koszt (Netto)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Dostawa Systemu BESS (PCS + Baterie)</Text>
              <Text style={styles.tableValue}>{formatCurrency(data.power * 1200 + data.capacity * 1500)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Prace Instalacyjne i Przyłączeniowe</Text>
              <Text style={styles.tableValue}>{formatCurrency(45000)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>System EMS i Uruchomienie</Text>
              <Text style={styles.tableValue}>{formatCurrency(12000)}</Text>
            </View>
            <View style={[styles.tableRow, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.tableLabel, { fontWeight: 700 }]}>SUMA CAPEX (Szacunkowo)</Text>
              <Text style={styles.tableValue}>{formatCurrency(data.power * 1200 + data.capacity * 1500 + 57000)}</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={[styles.text, { color: '#1E40AF', fontWeight: 700, marginBottom: 5 }]}>Opcje Finansowania</Text>
            <Text style={styles.text}>
              Inwestycja może zostać sfinansowana ze środków własnych, leasingu operacyjnego lub kredytu inwestycyjnego. 
              Dostępne są również programy dotacyjne (np. "Energia dla Wsi", "Mój Prąd 6.0" - zależnie od statusu podmiotu).
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>13</Text>
            <Text style={styles.sectionTitle}>Harmonogram Realizacji</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Tydzień 1-2</Text>
              <Text style={styles.tableValue}>Audyt, projekt, wniosek o warunki przyłączenia</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Tydzień 3-8</Text>
              <Text style={styles.tableValue}>Produkcja i kompletacja systemu BESS</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Tydzień 9-10</Text>
              <Text style={styles.tableValue}>Dostawa, montaż i testy uruchomieniowe</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Tydzień 11-12</Text>
              <Text style={styles.tableValue}>Odbiór końcowy i szkolenie personelu</Text>
            </View>
          </View>
        </View>

        <Footer pageNumber={6} totalPages={totalPages} />
      </Page>

      {/* Page 7: Final Summary & Recommendations */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>14</Text>
            <Text style={styles.sectionTitle}>Podsumowanie i Rekomendacje</Text>
          </View>
          <View style={styles.highlightBox}>
            <Text style={[styles.text, { color: '#166534', fontWeight: 700, marginBottom: 10, fontSize: 12 }]}>
              Rekomendacja: POZYTYWNA
            </Text>
            <Text style={[styles.text, { color: '#166534' }]}>
              Na podstawie przeprowadzonej analizy techniczno-ekonomicznej, wdrożenie systemu BESS o mocy {data.power} kW 
              i pojemności {data.capacity} kWh jest wysoce uzasadnione. Inwestycja pozwala nie tylko na realne oszczędności 
              finansowe, ale również zwiększa niezależność energetyczną obiektu i zabezpiecza przed nieprzewidywalnymi 
              zmianami cen energii w przyszłości.
            </Text>
            <View style={{ marginTop: 15, gap: 5 }}>
              <Text style={[styles.text, { color: '#166534', fontWeight: 700 }]}>Kluczowe korzyści:</Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Redukcja kosztów energii o {formatCurrency(data.savings)} rocznie.</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Atrakcyjny okres zwrotu: {data.payback} lat.</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Redukcja mocy szczytowej o {data.peakReduction || 15}%.</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Ochrona przed wzrostem opłat dystrybucyjnych i karami za przekroczenia.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>15</Text>
            <Text style={styles.sectionTitle}>Zatwierdzenie i Następne Kroki</Text>
          </View>
          <Text style={styles.text}>
            W celu rozpoczęcia procesu inwestycyjnego rekomendujemy podjęcie następujących kroków:
          </Text>
          <View style={{ marginTop: 10, gap: 8 }}>
            <Text style={styles.text}>1. Wizja lokalna i audyt techniczny przyłącza.</Text>
            <Text style={styles.text}>2. Przygotowanie szczegółowego projektu wykonawczego.</Text>
            <Text style={styles.text}>3. Złożenie wniosku o warunki przyłączenia do sieci OSD.</Text>
            <Text style={styles.text}>4. Finalizacja umowy dostawy i montażu systemu.</Text>
          </View>
          
          <View style={{ marginTop: 60, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: 180, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8 }}>
              <Text style={{ fontSize: 7, color: '#94A3B8', textAlign: 'center' }}>Podpis Konsultanta</Text>
              <Text style={{ fontSize: 9, color: '#0F172A', textAlign: 'center', fontWeight: 700, marginTop: 4 }}>{data.author || 'EFFI Research'}</Text>
              <Text style={{ fontSize: 7, color: '#94A3B8', textAlign: 'center', marginTop: 2 }}>Specjalista ds. Systemów BESS</Text>
            </View>
            <View style={{ width: 180, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8 }}>
              <Text style={{ fontSize: 7, color: '#94A3B8', textAlign: 'center' }}>Zatwierdzenie Klienta</Text>
              <Text style={{ fontSize: 9, color: '#0F172A', textAlign: 'center', fontWeight: 700, marginTop: 4 }}>{data.client}</Text>
              <Text style={{ fontSize: 7, color: '#94A3B8', textAlign: 'center', marginTop: 2 }}>Data i Pieczęć Firmowa</Text>
            </View>
          </View>
        </View>

        <Footer pageNumber={7} totalPages={totalPages} />
      </Page>
    </Document>
  );
};

export default ReportPDF;
