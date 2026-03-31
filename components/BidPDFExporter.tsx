import React, { useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  PDFViewer,
  Font,
  Image,
} from '@react-pdf/renderer';
import { BidData } from '../types.ts';
import { X } from 'lucide-react';

// ---------------------------------------------------------------------------
// PDF Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    padding: 48,
    fontSize: 10,
    color: '#1e293b',
  },
  headerBand: {
    backgroundColor: '#020617',
    margin: -48,
    marginBottom: 32,
    padding: 32,
    paddingLeft: 48,
    paddingRight: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerSub: {
    fontSize: 9,
    color: '#3b82f6',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 20,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    width: 100,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: 10,
    color: '#1e293b',
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    padding: '8 10',
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #f1f5f9',
    padding: '7 10',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  totalBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: '16 20',
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  proposalText: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.6,
    fontFamily: 'Helvetica-Oblique',
  },
  statusBadge: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    padding: '4 10',
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  accent: {
    width: 4,
    height: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    marginRight: 10,
    marginTop: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },
});

// ---------------------------------------------------------------------------
// PDF Document definition
// ---------------------------------------------------------------------------
const BidPDFDocument: React.FC<{ bid: BidData; currencySymbol: string }> = ({ bid, currencySymbol }) => {
  const materialTotal = bid.materials?.reduce((acc, m) => acc + (m.unitPrice * (parseFloat(m.quantity) || 1)), 0) || 0;
  const laborCost = bid.laborCost || 0;
  const grandTotal = materialTotal + laborCost;
  const statusColor = bid.status === 'Approved' ? '#10b981' : bid.status === 'Sent' ? '#3b82f6' : '#64748b';

  return (
    <Document title={`${bid.projectName} — EstiMetric Bid`} author="EstiMetric">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBand}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={styles.headerTitle}>EstiMetric</Text>
              <Text style={styles.headerSub}>Professional Bid Proposal</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.statusBadge, { backgroundColor: statusColor + '30', color: statusColor }]}>{bid.status}</Text>
              <Text style={[styles.footerText, { color: '#64748b', marginTop: 8 }]}>{bid.date}</Text>
            </View>
          </View>
        </View>

        {/* Project Info */}
        <View style={styles.sectionRow}>
          <View style={styles.accent} />
          <Text style={[styles.sectionLabel, { marginTop: 0, borderBottom: 'none', paddingBottom: 0 }]}>Project Information</Text>
        </View>

        <View style={{ backgroundColor: '#f8fafc', borderRadius: 8, padding: 16, marginTop: 8 }}>
          <View style={styles.row}>
            <Text style={styles.label}>Project</Text>
            <Text style={[styles.value, { fontFamily: 'Helvetica-Bold', fontSize: 14 }]}>{bid.projectName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{bid.clientName || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Project Tier</Text>
            <Text style={styles.value}>{bid.projectTier}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Measurements</Text>
            <Text style={styles.value}>{bid.measurements || '—'}</Text>
          </View>
        </View>

        {/* Materials Table */}
        <View style={styles.sectionRow}>
          <View style={styles.accent} />
          <Text style={[styles.sectionLabel, { marginTop: 0, borderBottom: 'none', paddingBottom: 0 }]}>Material Takeoff</Text>
        </View>

        <View style={[styles.tableHeader, { marginTop: 8 }]}>
          <Text style={[styles.tableCellBold, { flex: 3 }]}>MATERIAL</Text>
          <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' }]}>QTY</Text>
          <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' }]}>UNIT COST</Text>
          <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' }]}>SUBTOTAL</Text>
        </View>

        {bid.materials?.map((m, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 ? { backgroundColor: '#f8fafc' } : {}]}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{m.name}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{m.quantity}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{currencySymbol}{m.unitPrice.toLocaleString()}</Text>
            <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' }]}>
              {currencySymbol}{(m.unitPrice * (parseFloat(m.quantity) || 1)).toLocaleString()}
            </Text>
          </View>
        ))}

        {/* Subtotals */}
        <View style={{ marginTop: 12, borderTop: '1 solid #e2e8f0', paddingTop: 12 }}>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.label}>Materials Subtotal</Text>
            <Text style={[styles.value, { textAlign: 'right' }]}>{currencySymbol}{materialTotal.toLocaleString()}</Text>
          </View>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.label}>Labor</Text>
            <Text style={[styles.value, { textAlign: 'right' }]}>{currencySymbol}{laborCost.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.totalBand}>
          <Text style={styles.totalLabel}>Total Investment</Text>
          <Text style={styles.totalValue}>{currencySymbol}{grandTotal.toLocaleString()}</Text>
        </View>

        {/* Proposal Letter */}
        {(bid as any).proposalLetter && (
          <View style={{ marginTop: 24 }}>
            <View style={styles.sectionRow}>
              <View style={styles.accent} />
              <Text style={[styles.sectionLabel, { marginTop: 0, borderBottom: 'none', paddingBottom: 0 }]}>Cover Letter</Text>
            </View>
            <View style={{ marginTop: 8, padding: 16, borderLeft: '3 solid #3b82f6', backgroundColor: '#f8fafc', borderRadius: '0 8 8 0' }}>
              <Text style={styles.proposalText}>{(bid as any).proposalLetter}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>EstiMetric Enterprise — Precision Bidding Platform</Text>
          <Text style={styles.footerText}>{bid.projectName} · {bid.date}</Text>
        </View>
      </Page>
    </Document>
  );
};

// ---------------------------------------------------------------------------
// Export Modal Wrapper
// ---------------------------------------------------------------------------
const BidPDFExporter: React.FC<{ bid: BidData; currencySymbol: string; onClose: () => void }> = ({ bid, currencySymbol, onClose }) => {
  const filename = `${bid.projectName.replace(/\s+/g, '_')}_EstiMetric_Bid.pdf`;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-slate-900 rounded-3xl border border-white/10 w-full max-w-xl p-8 space-y-6 luxury-shadow">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Export Bid Proposal</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mt-1">{bid.projectName}</p>
        </div>

        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">PDF · A4</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Materials</span>
            <span className="text-[10px] font-black text-white">{bid.materials?.length || 0} line items</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Includes</span>
            <span className="text-[10px] font-black text-white">Proposal · Takeoff · Totals</span>
          </div>
        </div>

        <PDFDownloadLink
          document={<BidPDFDocument bid={bid} currencySymbol={currencySymbol} />}
          fileName={filename}
        >
          {({ blob, url, loading, error }) => (
            <button
              className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                loading
                  ? 'bg-slate-700 text-slate-400 cursor-wait'
                  : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95'
              }`}
            >
              {loading ? 'Generating PDF...' : error ? 'Error — Try Again' : '⬇  Download PDF'}
            </button>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default BidPDFExporter;
