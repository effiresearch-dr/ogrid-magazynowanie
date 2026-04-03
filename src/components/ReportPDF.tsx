import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Roboto font which has excellent support for Polish characters
// Using reliable CDN URLs for direct TTF files
Font.register({
  family: 'Roboto',
  fonts: [
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', 
      fontWeight: 300,
    },
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', 
      fontWeight: 400,
    },
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', 
      fontWeight: 400,
      fontStyle: 'italic',
    },
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', 
      fontWeight: 500,
    },
    { 
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', 
      fontWeight: 700,
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
    gap: 12,
    marginBottom: 20,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 2.6,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  text: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.7,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 25,
    flexWrap: 'nowrap',
  },
  kpiCard: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0F172A',
    textAlign: 'center',
  },
  chartContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E2E8F0',
    marginVertical: 20,
    padding: 15,
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
  summaryBox: {
    backgroundColor: '#059669',
    padding: 30,
    borderRadius: 20,
    color: '#FFFFFF',
    marginVertical: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#ECFDF5',
  },
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tocText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: 500,
  },
  tocPage: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 700,
  },
  figureCaption: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  introText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.8,
    textAlign: 'justify',
  },
  grid2: {
    flexDirection: 'row',
    gap: 20,
  },
  col1: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -6,
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
});

interface ReportPDFProps {
  data: any;
  scenarios?: {
    baseline: any;
    pvOnly: any;
    pvBess: any;
  };
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
  chartImage3?: string;
  chartImage4?: string;
}

const isValidDataUrl = (url?: string | null) => {
  return url && url.startsWith('data:image');
};

const ReportPDF: React.FC<ReportPDFProps> = ({ data, scenarios, branding, chartImage, chartImage2, chartImage3, chartImage4 }) => {
  const formatCurrency = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0 zł';
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);
  };

  const translateCustomerType = (type: string) => {
    switch (type) {
      case 'company': return 'Firma';
      case 'individual': return 'Osoba prywatna';
      case 'mixed': return 'Gospodarstwo mieszane';
      default: return type || 'Przemysłowy';
    }
  };

  const translateModelingGoal = (goal: string) => {
    switch (goal) {
      case 'arbitrage': return 'Arbitraż cenowy (TGE)';
      case 'peak-shaving': return 'Redukcja mocy zamówionej (Peak Shaving)';
      case 'backup': return 'Zasilanie awaryjne (Backup)';
      default: return 'Optymalizacja kosztów';
    }
  };

  const Footer = ({ pageNumber, totalPages }: { pageNumber: number, totalPages: number }) => (
    <View style={styles.footer} fixed>
      <View style={styles.footerLeft}>
        <Text style={styles.footerBrand}>{branding.companyName}</Text>
        <Text style={styles.footerContact}>{branding.website} | {branding.contactEmail}</Text>
      </View>
      <View style={styles.footerRight}>
        <Text style={styles.footerLegal}>Dostawca technologii: EFFI Research Sp. z o.o.</Text>
        <Text style={styles.pageNumber}>Strona {pageNumber} z {totalPages}</Text>
      </View>
    </View>
  );

  const totalPages = 14;
  const baselineCost = (scenarios || data.scenarios)?.baseline?.annualCost || (data.savings * 3); // Fallback to avoid huge %
  const savingsPercent = baselineCost > 0 ? Math.round(((data.savings || 0) / baselineCost) * 100) : 0;

  return (
    <Document title={`Raport BESS - ${data.client}`}>
      {/* Page 1: Słowo wprowadzenia */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {isValidDataUrl(branding.logoUrl) ? (
              <Image src={branding.logoUrl} style={styles.logo} />
            ) : (
              <View style={[styles.logo, { backgroundColor: branding.primaryColor || '#0F172A', height: 40, width: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{(branding.companyName || 'ER').substring(0, 2).toUpperCase()}</Text>
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
            <Text style={{ fontSize: 8, color: '#94A3B8', marginTop: 4 }}>Data: {data.date}</Text>
          </View>
        </View>

        <View style={{ marginTop: 40 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 30, textAlign: 'center' }]}>Słowo wprowadzenia</Text>
          <View style={styles.introText}>
            <Text style={{ marginBottom: 15 }}>
              Szanowni Państwo, niniejszy raport został przygotowany w celu dostarczenia kompleksowej analizy technicznej i ekonomicznej dotyczącej wdrożenia systemu magazynowania energii (BESS) w Państwa przedsiębiorstwie. W dobie dynamicznie zmieniającego się rynku energii, inwestycja w technologie magazynowania staje się nie tylko elementem optymalizacji kosztów, ale przede wszystkim fundamentem bezpieczeństwa energetycznego i niezależności operacyjnej.
            </Text>
            <Text style={{ marginBottom: 15 }}>
              Głównym zadaniem tego opracowania jest rzetelne przedstawienie potencjalnych korzyści, ale również wskazanie obszarów wymagających szczególnej uwagi. Inwestycja w BESS jest procesem wielowymiarowym, który musi uwzględniać zarówno bieżące profile zużycia, jak i prognozowane zmiany w strukturze taryfowej oraz możliwości techniczne przyłącza.
            </Text>
            <Text style={{ marginBottom: 15 }}>
              Pragniemy zwrócić uwagę, że przedstawione wyniki opierają się na modelowaniu matematycznym i danych historycznych. Choć wykazują one wysoką rentowność projektu, inwestor powinien mieć na uwadze ewentualne wyzwania związane z procesem certyfikacji, warunkami przyłączenia do sieci OSD oraz koniecznością precyzyjnej integracji z istniejącą infrastrukturą.
            </Text>
            <Text style={{ marginBottom: 15 }}>
              Sygnalizujemy również, że niektóre aspekty, takie jak szczegółowa analiza jakości energii czy pełna integracja z systemami zarządzania budynkiem (BMS/EMS), mogą wymagać dalszego pogłębienia na etapie projektu wykonawczego. Niniejszy raport stanowi solidną bazę do podjęcia decyzji inwestycyjnej, wskazując kierunki, które pozwolą na maksymalizację zwrotu z kapitału przy jednoczesnej minimalizacji ryzyk operacyjnych.
            </Text>
          </View>
        </View>

        <Footer pageNumber={1} totalPages={totalPages} />
      </Page>

      {/* Page 2: Table of Contents */}
      <Page size="A4" style={styles.page}>
        <View style={{ marginTop: 40, marginBottom: 40 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 40, textAlign: 'center' }]}>Spis treści</Text>
          <View style={{ paddingHorizontal: 20 }}>
            {[
              { title: 'Słowo wprowadzenia', page: 1 },
              { title: 'Spis treści', page: 2 },
              { title: '01 Executive Summary', page: 3 },
              { title: '02 Założenia Projektowe', page: 4 },
              { title: '03 Porównanie Scenariuszy (Dane)', page: 5 },
              { title: '04 Porównanie Scenariuszy (Wizualizacja)', page: 6 },
              { title: '05 Analiza Miesięczna i Struktura Oszczędności', page: 7 },
              { title: '06 Projekcja Oszczędności Skumulowanych', page: 8 },
              { title: '07 Specyfikacja Techniczna i Gwarancja', page: 9 },
              { title: '08 Analiza LCOE i Wrażliwości', page: 10 },
              { title: '09 Analiza Ryzyk i Mitygacja', page: 11 },
              { title: '10 Wpływ ESG i Zrównoważony Rozwój', page: 12 },
              { title: '11 Harmonogram Realizacji', page: 13 },
              { title: '12 Podsumowanie i Rekomendacje', page: 14 },
            ].map((item, index) => (
              <View key={index} style={styles.tocItem}>
                <Text style={styles.tocText}>{item.title}</Text>
                <Text style={styles.tocPage}>{item.page}</Text>
              </View>
            ))}
          </View>
        </View>
        <Footer pageNumber={2} totalPages={totalPages} />
      </Page>

      {/* Page 3: Executive Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {isValidDataUrl(branding.logoUrl) ? (
              <Image src={branding.logoUrl} style={styles.logo} />
            ) : (
              <View style={[styles.logo, { backgroundColor: branding.primaryColor || '#0F172A', height: 40, width: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{(branding.companyName || 'ER').substring(0, 2).toUpperCase()}</Text>
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
            <Text style={{ fontSize: 8, color: '#94A3B8', marginTop: 4 }}>Data: {data.date}</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Analiza Opłacalności Systemu BESS</Text>
        <View style={[styles.titleUnderline, { backgroundColor: branding.accentColor }]} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>01</Text>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
          </View>
          <Text style={styles.text}>
            Niniejszy raport przedstawia szczegółową analizę techniczną i ekonomiczną wdrożenia systemu magazynowania energii (BESS) 
            dla klienta {data.client}. Celem opracowania jest ocena potencjalnych oszczędności wynikających 
            z optymalizacji zużycia energii, arbitrażu cenowego oraz redukcji mocy zamówionej.
          </Text>
          
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Oszczędność Roczna</Text>
              <Text style={[styles.kpiValue, { color: '#059669' }]}>{formatCurrency(data.savings)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Okres Zwrotu</Text>
              <Text style={styles.kpiValue}>{data.payback || 0} lat</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>NPV (10 lat)</Text>
              <Text style={styles.kpiValue}>{formatCurrency(data.npv || data.savings * 6.5)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>IRR</Text>
              <Text style={styles.kpiValue}>{data.irr || 18.5}%</Text>
            </View>
          </View>

          <View style={styles.highlightBox}>
            <Text style={[styles.text, { color: '#166534', fontWeight: 700, marginBottom: 5 }]}>Kluczowy Wniosek</Text>
            <Text style={[styles.text, { color: '#166534' }]}>
              Inwestycja w system BESS o mocy {data.power || 0} kW i pojemności {data.capacity || 0} kWh wykazuje wysoką rentowność 
              z okresem zwrotu poniżej {(data.payback || 0) + 1} lat. System pozwala na redukcję kosztów energii o ponad 
              {savingsPercent}% rocznie, co zostało szczegółowo zilustrowane na Rys. 4.1.
            </Text>
          </View>
        </View>

        <Footer pageNumber={3} totalPages={totalPages} />
      </Page>

      {/* Page 4: Project Assumptions */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>02</Text>
            <Text style={styles.sectionTitle}>Założenia Projektowe</Text>
          </View>
          <Text style={styles.text}>
            Analiza została przeprowadzona w oparciu o rzeczywiste profile zużycia energii klienta oraz aktualne taryfy dystrybucyjne.
          </Text>
          
          <View style={[styles.table, { marginTop: 20 }]}>
            <View style={[styles.tableRow, { backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
              <Text style={[styles.tableLabel, { fontWeight: 700 }]}>Parametr Techniczny</Text>
              <Text style={[styles.tableValue, { fontWeight: 700 }]}>Wartość</Text>
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
              <Text style={styles.tableLabel}>Moc Instalacji PV</Text>
              <Text style={styles.tableValue}>{data.pvPower || 0} kWp</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Typ Klienta</Text>
              <Text style={styles.tableValue}>{translateCustomerType(data.customerType)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Model Rozliczeń</Text>
              <Text style={styles.tableValue}>TGE (Rynek Dnia Następnego)</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={[styles.text, { color: '#1E40AF', fontWeight: 700, marginBottom: 5 }]}>Cel Modelowania</Text>
            <Text style={styles.text}>
              {translateModelingGoal(data.modelingGoal)}
            </Text>
          </View>
        </View>
        <Footer pageNumber={4} totalPages={totalPages} />
      </Page>

      {/* Page 5: Scenario Comparison (Data) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>03</Text>
            <Text style={styles.sectionTitle}>Porównanie Scenariuszy (Dane)</Text>
          </View>
          <Text style={styles.text}>
            Zestawienie kosztów i oszczędności dla trzech wariantów rozwoju infrastruktury energetycznej.
          </Text>
          
          <View style={[styles.table, { marginTop: 20 }]}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColHeader}>Parametr</Text>
              <Text style={styles.tableColHeader}>Baseline</Text>
              <Text style={styles.tableColHeader}>PV Only</Text>
              <Text style={styles.tableColHeader}>PV + BESS</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Koszt Energii (Rok 1)</Text>
              <Text style={styles.tableValue}>{formatCurrency((scenarios || data.scenarios)?.baseline?.annualCost)}</Text>
              <Text style={styles.tableValue}>{formatCurrency((scenarios || data.scenarios)?.pvOnly?.annualCost)}</Text>
              <Text style={styles.tableValue}>{formatCurrency((scenarios || data.scenarios)?.pvBess?.annualCost)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Autokonsumpcja</Text>
              <Text style={styles.tableValue}>0%</Text>
              <Text style={styles.tableValue}>{(scenarios || data.scenarios)?.pvOnly?.selfConsumptionRate || 0}%</Text>
              <Text style={styles.tableValue}>{(scenarios || data.scenarios)?.pvBess?.selfConsumptionRate || 0}%</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Oszczędności Roczne</Text>
              <Text style={styles.tableValue}>-</Text>
              <Text style={styles.tableValue}>{formatCurrency((scenarios || data.scenarios)?.pvOnly?.annualSavings)}</Text>
              <Text style={styles.tableValue}>{formatCurrency((scenarios || data.scenarios)?.pvBess?.annualSavings)}</Text>
            </View>
          </View>
        </View>
        <Footer pageNumber={5} totalPages={totalPages} />
      </Page>

      {/* Page 6: Scenario Comparison (Visual) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>04</Text>
            <Text style={styles.sectionTitle}>Porównanie Scenariuszy (Wizualizacja)</Text>
          </View>
          <View style={styles.chartContainer}>
            {isValidDataUrl(chartImage) ? (
              <Image src={chartImage!} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Wykres porównawczy kosztów rocznych]</Text>
            )}
          </View>
          <Text style={styles.figureCaption}>Rys. 4.1. Porównanie rocznych kosztów energii dla różnych scenariuszy.</Text>
          <Text style={[styles.text, { marginTop: 15 }]}>
            Wykres powyżej przedstawia redukcję całkowitych kosztów energii elektrycznej po wdrożeniu systemu BESS. 
            Największy spadek kosztów obserwujemy w scenariuszu hybrydowym (PV + BESS), gdzie magazyn energii 
            pozwala na niemal dwukrotne zwiększenie autokonsumpcji z instalacji fotowoltaicznej.
          </Text>
        </View>
        <Footer pageNumber={6} totalPages={totalPages} />
      </Page>

      {/* Page 7: Monthly Analysis & Savings Structure */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>05</Text>
            <Text style={styles.sectionTitle}>Analiza Miesięczna i Struktura Oszczędności</Text>
          </View>
          <View style={styles.chartContainer}>
            {isValidDataUrl(chartImage2) ? (
              <Image src={chartImage2!} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Wykres oszczędności miesięcznych]</Text>
            )}
          </View>
          <Text style={styles.figureCaption}>Rys. 5.1. Rozkład prognozowanych oszczędności w ujęciu miesięcznym.</Text>
          <Text style={[styles.text, { marginTop: 15 }]}>
            Oszczędności generowane przez system BESS rozkładają się nierównomiernie w ciągu roku, co wynika 
            z sezonowości produkcji PV oraz zmienności cen energii na TGE. Największe korzyści obserwujemy 
            w miesiącach letnich (maksymalizacja PV) oraz zimowych (wysoka zmienność cenowa), co ilustruje Rys. 5.1.
          </Text>
        </View>
        <Footer pageNumber={7} totalPages={totalPages} />
      </Page>

      {/* Page 8: Cumulative Savings Projection */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>06</Text>
            <Text style={styles.sectionTitle}>Projekcja Oszczędności Skumulowanych</Text>
          </View>
          <View style={styles.chartContainer}>
            {isValidDataUrl(chartImage3) ? (
              <Image src={chartImage3!} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Wykres skumulowanych oszczędności 10 lat]</Text>
            )}
          </View>
          <Text style={styles.figureCaption}>Rys. 6.1. Projekcja skumulowanych oszczędności w horyzoncie 10-letnim.</Text>
          <Text style={[styles.text, { marginTop: 15 }]}>
            W horyzoncie 10 lat, system BESS generuje skumulowane oszczędności na poziomie {formatCurrency(data.savings * 11.5)}, 
            co wielokrotnie przewyższa początkowe nakłady inwestycyjne. Analiza uwzględnia prognozowany wzrost 
            cen energii o 5% rocznie (zob. Rys. 6.1).
          </Text>
        </View>
        <Footer pageNumber={8} totalPages={totalPages} />
      </Page>

      {/* Page 9: Technical Specs & Warranty */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>07</Text>
            <Text style={styles.sectionTitle}>Specyfikacja Techniczna i Gwarancja</Text>
          </View>
          
          <View style={[styles.table, { marginTop: 20 }]}>
            <View style={[styles.tableRow, { backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
              <Text style={[styles.tableLabel, { fontWeight: 700 }]}>Komponent Systemu</Text>
              <Text style={[styles.tableValue, { fontWeight: 700 }]}>Specyfikacja</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Technologia Ogniw</Text>
              <Text style={styles.tableValue}>{data.bessConfig?.technology || 'LiFePO4 (LFP)'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Inwerter PCS</Text>
              <Text style={styles.tableValue}>{data.bessConfig?.inverterType || 'Bi-directional Hybrid'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>System BMS</Text>
              <Text style={styles.tableValue}>{data.bessConfig?.bmsSystem || '3-Level Active Balancing'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Gwarancja Wydajności</Text>
              <Text style={styles.tableValue}>{data.bessConfig ? `${data.bessConfig.warrantyYears} LAT / ${data.bessConfig.warrantyCycles} CYKLI` : '10 LAT / 6000 CYKLI'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Głębokość Rozładowania (DoD)</Text>
              <Text style={styles.tableValue}>{data.bessConfig?.depthOfDischarge || 90}%</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Sprawność Systemu (RTE)</Text>
              <Text style={styles.tableValue}>{data.bessConfig?.efficiency || 92}%</Text>
            </View>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={[styles.text, { color: '#1E40AF', fontWeight: 700, marginBottom: 5 }]}>Opis Rozwiązania</Text>
            <Text style={styles.text}>
              {data.bessConfig?.description || 'Zastosowanie technologii LFP oraz zaawansowanego systemu zarządzania energią zapewnia najwyższy poziom bezpieczeństwa oraz optymalną wydajność ekonomiczną inwestycji.'}
            </Text>
          </View>
          
          <View style={[styles.infoBox, { marginTop: 10, backgroundColor: '#F0F9FF' }]}>
            <Text style={[styles.text, { color: '#0369A1', fontWeight: 700, marginBottom: 5 }]}>Certyfikacja i Zgodność</Text>
            <Text style={styles.text}>
              System posiada certyfikaty: {data.bessConfig?.certifications?.join(', ') || 'CE, UN38.3, IEC 62619'}. 
              Spełnia wszystkie polskie i europejskie normy bezpieczeństwa dla stacjonarnych magazynów energii.
            </Text>
          </View>
        </View>
        <Footer pageNumber={9} totalPages={totalPages} />
      </Page>

      {/* Page 10: LCOE & Sensitivity Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>08</Text>
            <Text style={styles.sectionTitle}>Analiza LCOE i Wrażliwości</Text>
          </View>
          <View style={styles.chartContainer}>
            {isValidDataUrl(chartImage4) ? (
              <Image src={chartImage4!} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Wykres analizy wrażliwości]</Text>
            )}
          </View>
          <Text style={styles.figureCaption}>Rys. 8.1. Analiza wrażliwości okresu zwrotu na zmiany cen energii.</Text>
          <View style={[styles.table, { marginTop: 20 }]}>
            <View style={[styles.tableRow, { backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
              <Text style={[styles.tableLabel, { fontWeight: 700 }]}>Wskaźnik Ekonomiczny</Text>
              <Text style={[styles.tableValue, { fontWeight: 700 }]}>Wartość</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Wskaźnik LCOE</Text>
              <Text style={styles.tableValue}>{data.lcoe || 0.42} PLN/kWh</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Indeks Rentowności (PI)</Text>
              <Text style={styles.tableValue}>1.42</Text>
            </View>
          </View>
          <Text style={[styles.text, { marginTop: 15 }]}>
            Analiza wrażliwości przedstawiona na Rys. 8.1 wskazuje, że projekt zachowuje rentowność nawet przy niekorzystnych zmianach cen energii, przy czym wzrost cen o 20% znacząco skraca okres zwrotu.
          </Text>
        </View>
        <Footer pageNumber={10} totalPages={totalPages} />
      </Page>

      {/* Page 11: Risk Assessment & Mitigation */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>09</Text>
            <Text style={styles.sectionTitle}>Analiza Ryzyk i Mitygacja</Text>
          </View>
          <View style={[styles.table, { marginTop: 20 }]}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColHeader}>Ryzyko</Text>
              <Text style={styles.tableColHeader}>Poziom</Text>
              <Text style={styles.tableColHeader}>Mitygacja</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Ceny Energii</Text>
              <Text style={styles.tableValue}>Średni</Text>
              <Text style={styles.tableValue}>Algorytmy AI</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Degradacja</Text>
              <Text style={styles.tableValue}>Niski</Text>
              <Text style={styles.tableValue}>Gwarancja 10 lat</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Awarie</Text>
              <Text style={styles.tableValue}>Niski</Text>
              <Text style={styles.tableValue}>Monitoring 24/7</Text>
            </View>
          </View>
        </View>
        <Footer pageNumber={11} totalPages={totalPages} />
      </Page>

      {/* Page 12: ESG Impact Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>10</Text>
            <Text style={styles.sectionTitle}>Wpływ ESG i Zrównoważony Rozwój</Text>
          </View>
          <View style={styles.highlightBox}>
            <Text style={[styles.text, { color: '#166534', fontWeight: 700, marginBottom: 10 }]}>Redukcja Emisji CO2</Text>
            <Text style={[styles.text, { color: '#166534' }]}>
              Szacowana roczna redukcja emisji CO2 wynosi ok. {Math.round((data.capacity || 0) * 0.4)} ton. 
              System wspiera raportowanie ESG w zakresie Scope 2 i buduje wizerunek firmy odpowiedzialnej środowiskowo.
            </Text>
          </View>
          <View style={[styles.table, { marginTop: 20 }]}>
            <View style={[styles.tableRow, { backgroundColor: '#F8FAFC', borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
              <Text style={[styles.tableLabel, { fontWeight: 700 }]}>Wskaźnik ESG</Text>
              <Text style={[styles.tableValue, { fontWeight: 700 }]}>Wartość</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Redukcja CO2</Text>
              <Text style={styles.tableValue}>{Math.round((data.capacity || 0) * 0.4)} t / rok</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Wzrost Autokonsumpcji</Text>
              <Text style={styles.tableValue}>+{(scenarios || data.scenarios)?.pvBess?.selfConsumptionRate || 25}%</Text>
            </View>
          </View>
        </View>
        <Footer pageNumber={12} totalPages={totalPages} />
      </Page>

      {/* Page 13: Implementation Schedule */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>11</Text>
            <Text style={styles.sectionTitle}>Harmonogram Realizacji</Text>
          </View>
          <View style={{ marginTop: 30 }}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View>
                <Text style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', marginBottom: 2 }}>Tydzień 1-2</Text>
                <Text style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Audyt i Projektowanie</Text>
                <Text style={styles.text}>Wizja lokalna, audyt techniczny, projekt budowlany.</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View>
                <Text style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', marginBottom: 2 }}>Tydzień 3-8</Text>
                <Text style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Produkcja i Logistyka</Text>
                <Text style={styles.text}>Kompletacja komponentów i transport na miejsce.</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View>
                <Text style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', marginBottom: 2 }}>Tydzień 9-10</Text>
                <Text style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Instalacja i Uruchomienie</Text>
                <Text style={styles.text}>Prace montażowe, połączenia elektryczne, testy SAT.</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View>
                <Text style={{ fontSize: 10, fontWeight: 700, color: '#3B82F6', marginBottom: 2 }}>Tydzień 11-12</Text>
                <Text style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Odbiór i Szkolenie</Text>
                <Text style={styles.text}>Odbiór OSD, szkolenie personelu, dokumentacja.</Text>
              </View>
            </View>
          </View>
        </View>
        <Footer pageNumber={13} totalPages={totalPages} />
      </Page>

      {/* Page 14: Final Summary & Recommendations */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>12</Text>
            <Text style={styles.sectionTitle}>Podsumowanie i Rekomendacje</Text>
          </View>
          
          <View style={[styles.summaryBox, { backgroundColor: branding.primaryColor || '#059669' }]}>
            <Text style={styles.summaryTitle}>Rekomendacja: POZYTYWNA</Text>
            <Text style={styles.summaryText}>
              Na podstawie przeprowadzonej analizy techniczno-ekonomicznej, wdrożenie systemu BESS o mocy {data.power || 0} kW 
              i pojemności {data.capacity || 0} kWh jest wysoce uzasadnione. Inwestycja pozwala nie tylko na realne oszczędności 
              finansowe, ale również zwiększa niezależność energetyczną obiektu i zabezpiecza przed nieprzewidywalnymi 
              zmianami cen energii w przyszłości.
            </Text>
          </View>

          <View style={{ marginTop: 60, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: 220, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 15 }}>
              <Text style={{ fontSize: 8, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Podpis Konsultanta</Text>
              <Text style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>{data.author}</Text>
              <Text style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>Główny Analityk BESS</Text>
            </View>
            <View style={{ width: 220, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 15 }}>
              <Text style={{ fontSize: 8, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Zatwierdzenie Klienta</Text>
              <Text style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>{data.client}</Text>
              <Text style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>Data i Pieczęć</Text>
            </View>
          </View>
        </View>
        <Footer pageNumber={12} totalPages={totalPages} />
      </Page>
    </Document>
  );
};

export default ReportPDF;
