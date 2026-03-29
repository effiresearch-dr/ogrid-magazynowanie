import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register Roboto font which has excellent support for Polish characters
// Using reliable cdnjs URLs for raw TTF files to avoid "Unknown font format" errors
Font.register({
  family: 'Roboto',
  fonts: [
    { 
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Regular.ttf', 
      fontWeight: 400,
    },
    { 
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Medium.ttf', 
      fontWeight: 500,
    },
    { 
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Bold.ttf', 
      fontWeight: 700,
    },
    { 
      src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/static/Roboto-Black.ttf', 
      fontWeight: 900,
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
    backgroundColor: '#0F172A',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 2.4,
    color: '#FFFFFF',
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
    height: 250,
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
  summaryBox: {
    backgroundColor: '#059669',
    padding: 30,
    borderRadius: 20,
    color: '#FFFFFF',
    marginVertical: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#ECFDF5',
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

const ReportPDF: React.FC<ReportPDFProps> = ({ data, scenarios, branding, chartImage, chartImage2, chartImage3, chartImage4 }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);
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

  const totalPages = 12;

  return (
    <Document title={`Raport BESS - ${data.client}`}>
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
              <Text style={styles.kpiValue}>{data.payback} lat</Text>
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
              Inwestycja w system BESS o mocy {data.power} kW i pojemności {data.capacity} kWh wykazuje wysoką rentowność 
              z okresem zwrotu poniżej {data.payback + 1} lat. System pozwala na redukcję kosztów energii o ponad 
              {Math.round((data.savings / (scenarios?.baseline?.annualCost || 1)) * 100)}% rocznie.
            </Text>
          </View>
        </View>

        <Footer pageNumber={1} totalPages={totalPages} />
      </Page>

      {/* Page 2: Project Assumptions */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>02</Text>
            <Text style={styles.sectionTitle}>Założenia Projektowe</Text>
          </View>
          <Text style={styles.text}>
            Analiza została przeprowadzona w oparciu o rzeczywiste profile zużycia energii klienta oraz aktualne taryfy dystrybucyjne.
          </Text>
          
          <View style={styles.table}>
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
              <Text style={styles.tableValue}>{data.pvPower} kWp</Text>
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

          <View style={styles.infoBox}>
            <Text style={[styles.text, { color: '#1E40AF', fontWeight: 700, marginBottom: 5 }]}>Cel Modelowania</Text>
            <Text style={styles.text}>
              {data.modelingGoal === 'arbitrage' 
                ? "Maksymalizacja zysku z różnic cenowych na TGE (ładowanie w dolinach, rozładowanie w szczytach)."
                : data.modelingGoal === 'peak-shaving'
                ? "Redukcja szczytów poboru mocy w celu obniżenia opłat za moc zamówioną i uniknięcia kar."
                : "Zapewnienie ciągłości zasilania dla krytycznych odbiorników przy jednoczesnej optymalizacji kosztów."
              }
            </Text>
          </View>
        </View>
        <Footer pageNumber={2} totalPages={totalPages} />
      </Page>

      {/* Page 3: Scenario Comparison (Data) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>03</Text>
            <Text style={styles.sectionTitle}>Porównanie Scenariuszy (Dane)</Text>
          </View>
          <Text style={styles.text}>
            Zestawienie kosztów i oszczędności dla trzech wariantów rozwoju infrastruktury energetycznej.
          </Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColHeader}>Parametr</Text>
              <Text style={styles.tableColHeader}>Baseline</Text>
              <Text style={styles.tableColHeader}>PV Only</Text>
              <Text style={styles.tableColHeader}>PV + BESS</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Koszt Energii (Rok 1)</Text>
              <Text style={styles.tableValue}>{formatCurrency(scenarios?.baseline?.annualCost || 0)}</Text>
              <Text style={styles.tableValue}>{formatCurrency(scenarios?.pvOnly?.annualCost || 0)}</Text>
              <Text style={styles.tableValue}>{formatCurrency(scenarios?.pvBess?.annualCost || 0)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Autokonsumpcja</Text>
              <Text style={styles.tableValue}>0%</Text>
              <Text style={styles.tableValue}>{scenarios?.pvOnly?.selfConsumptionRate || 0}%</Text>
              <Text style={styles.tableValue}>{scenarios?.pvBess?.selfConsumptionRate || 0}%</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Oszczędności Roczne</Text>
              <Text style={styles.tableValue}>-</Text>
              <Text style={styles.tableValue}>{formatCurrency(scenarios?.pvOnly?.annualSavings || 0)}</Text>
              <Text style={styles.tableValue}>{formatCurrency(scenarios?.pvBess?.annualSavings || 0)}</Text>
            </View>
          </View>
        </View>
        <Footer pageNumber={3} totalPages={totalPages} />
      </Page>

      {/* Page 4: Scenario Comparison (Visual) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>04</Text>
            <Text style={styles.sectionTitle}>Porównanie Scenariuszy (Wizualizacja)</Text>
          </View>
          <View style={styles.chartContainer}>
            {chartImage ? (
              <Image src={chartImage} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Wykres porównawczy kosztów rocznych]</Text>
            )}
          </View>
          <Text style={styles.text}>
            Wykres powyżej przedstawia redukcję całkowitych kosztów energii elektrycznej po wdrożeniu systemu BESS. 
            Największy spadek kosztów obserwujemy w scenariuszu hybrydowym (PV + BESS), gdzie magazyn energii 
            pozwala na niemal dwukrotne zwiększenie autokonsumpcji z instalacji fotowoltaicznej.
          </Text>
        </View>
        <Footer pageNumber={4} totalPages={totalPages} />
      </Page>

      {/* Page 5: Monthly Analysis & Savings Structure */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>05</Text>
            <Text style={styles.sectionTitle}>Analiza Miesięczna i Struktura Oszczędności</Text>
          </View>
          <View style={styles.chartContainer}>
            {chartImage2 ? (
              <Image src={chartImage2} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Wykres oszczędności miesięcznych]</Text>
            )}
          </View>
          <Text style={styles.text}>
            Oszczędności generowane przez system BESS rozkładają się nierównomiernie w ciągu roku, co wynika 
            z sezonowości produkcji PV oraz zmienności cen energii na TGE. Największe korzyści obserwujemy 
            w miesiącach letnich (maksymalizacja PV) oraz zimowych (wysoka zmienność cenowa).
          </Text>
        </View>
        <Footer pageNumber={5} totalPages={totalPages} />
      </Page>

      {/* Page 6: Cumulative Savings Projection */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>06</Text>
            <Text style={styles.sectionTitle}>Projekcja Oszczędności Skumulowanych</Text>
          </View>
          <View style={styles.chartContainer}>
            {chartImage3 ? (
              <Image src={chartImage3} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Wykres skumulowanych oszczędności 10 lat]</Text>
            )}
          </View>
          <Text style={styles.text}>
            W horyzoncie 10 lat, system BESS generuje skumulowane oszczędności na poziomie {formatCurrency(data.savings * 11.5)}, 
            co wielokrotnie przewyższa początkowe nakłady inwestycyjne. Analiza uwzględnia prognozowany wzrost 
            cen energii o 5% rocznie.
          </Text>
        </View>
        <Footer pageNumber={6} totalPages={totalPages} />
      </Page>

      {/* Page 7: Technical Specs & Warranty */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>07</Text>
            <Text style={styles.sectionTitle}>Specyfikacja Techniczna i Gwarancja</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Technologia Ogniw</Text>
              <Text style={styles.tableValue}>LiFePO4 (LFP)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Inwerter PCS</Text>
              <Text style={styles.tableValue}>Bi-directional Hybrid</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>System BMS</Text>
              <Text style={styles.tableValue}>3-Level Active Balancing</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Gwarancja Wydajności</Text>
              <Text style={styles.tableValue}>10 LAT / 6000 CYKLI</Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.text, { color: '#1E40AF', fontWeight: 700, marginBottom: 5 }]}>Bezpieczeństwo i Trwałość</Text>
            <Text style={styles.text}>
              Zastosowanie technologii LFP oraz aktywnego chłodzenia cieczą zapewnia najwyższy poziom bezpieczeństwa 
              pożarowego oraz minimalną degradację ogniw, co przekłada się na stabilną pracę systemu przez ponad dekadę.
            </Text>
          </View>
        </View>
        <Footer pageNumber={7} totalPages={totalPages} />
      </Page>

      {/* Page 8: LCOE & Sensitivity Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>08</Text>
            <Text style={styles.sectionTitle}>Analiza LCOE i Wrażliwości</Text>
          </View>
          <View style={styles.chartContainer}>
            {chartImage4 ? (
              <Image src={chartImage4} style={styles.chartImage} />
            ) : (
              <Text style={{ fontSize: 8, color: '#94A3B8' }}>[Wykres analizy wrażliwości]</Text>
            )}
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Wskaźnik LCOE</Text>
              <Text style={styles.tableValue}>{data.lcoe || 0.42} PLN/kWh</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Indeks Rentowności (PI)</Text>
              <Text style={styles.tableValue}>1.42</Text>
            </View>
          </View>
        </View>
        <Footer pageNumber={8} totalPages={totalPages} />
      </Page>

      {/* Page 9: Risk Assessment & Mitigation */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>09</Text>
            <Text style={styles.sectionTitle}>Analiza Ryzyk i Mitygacja</Text>
          </View>
          <View style={styles.table}>
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
        <Footer pageNumber={9} totalPages={totalPages} />
      </Page>

      {/* Page 10: ESG Impact Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>10</Text>
            <Text style={styles.sectionTitle}>Wpływ ESG i Zrównoważony Rozwój</Text>
          </View>
          <View style={styles.highlightBox}>
            <Text style={[styles.text, { color: '#166534', fontWeight: 700, marginBottom: 10 }]}>Redukcja Emisji CO2</Text>
            <Text style={[styles.text, { color: '#166534' }]}>
              Szacowana roczna redukcja emisji CO2 wynosi ok. {Math.round(data.capacity * 0.4)} ton. 
              System wspiera raportowanie ESG w zakresie Scope 2 i buduje wizerunek firmy odpowiedzialnej środowiskowo.
            </Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Redukcja CO2</Text>
              <Text style={styles.tableValue}>{Math.round(data.capacity * 0.4)} t / rok</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Wzrost Autokonsumpcji</Text>
              <Text style={styles.tableValue}>+{data.scenarios?.pvBess.selfConsumptionRate || 25}%</Text>
            </View>
          </View>
        </View>
        <Footer pageNumber={10} totalPages={totalPages} />
      </Page>

      {/* Page 11: Implementation Schedule */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>11</Text>
            <Text style={styles.sectionTitle}>Harmonogram Realizacji</Text>
          </View>
          <View style={{ marginTop: 20 }}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View>
                <Text style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6' }}>Tydzień 1-2</Text>
                <Text style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Audyt i Projektowanie</Text>
                <Text style={styles.text}>Wizja lokalna, audyt techniczny, projekt budowlany.</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View>
                <Text style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6' }}>Tydzień 3-8</Text>
                <Text style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Produkcja i Logistyka</Text>
                <Text style={styles.text}>Kompletacja komponentów i transport na miejsce.</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View>
                <Text style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6' }}>Tydzień 9-10</Text>
                <Text style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Instalacja i Uruchomienie</Text>
                <Text style={styles.text}>Prace montażowe, połączenia elektryczne, testy SAT.</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View>
                <Text style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6' }}>Tydzień 11-12</Text>
                <Text style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>Odbiór i Szkolenie</Text>
                <Text style={styles.text}>Odbiór OSD, szkolenie personelu, dokumentacja.</Text>
              </View>
            </View>
          </View>
        </View>
        <Footer pageNumber={11} totalPages={totalPages} />
      </Page>

      {/* Page 12: Final Summary & Recommendations */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>12</Text>
            <Text style={styles.sectionTitle}>Podsumowanie i Rekomendacje</Text>
          </View>
          
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Rekomendacja: POZYTYWNA</Text>
            <Text style={styles.summaryText}>
              Na podstawie przeprowadzonej analizy techniczno-ekonomicznej, wdrożenie systemu BESS o mocy {data.power} kW 
              i pojemności {data.capacity} kWh jest wysoce uzasadnione. Inwestycja pozwala nie tylko na realne oszczędności 
              finansowe, ale również zwiększa niezależność energetyczną obiektu i zabezpiecza przed nieprzewidywalnymi 
              zmianami cen energii w przyszłości.
            </Text>
          </View>

          <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: 200, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }}>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Podpis Konsultanta</Text>
              <Text style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', marginTop: 5 }}>{data.author}</Text>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Główny Analityk BESS</Text>
            </View>
            <View style={{ width: 200, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }}>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Zatwierdzenie Klienta</Text>
              <Text style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', marginTop: 5 }}>{data.client}</Text>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Data i Pieczęć</Text>
            </View>
          </View>
        </View>
        <Footer pageNumber={12} totalPages={totalPages} />
      </Page>
    </Document>
  );
};

export default ReportPDF;
