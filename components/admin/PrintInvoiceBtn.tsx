'use client';

import { Printer, Loader2 } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define types
interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  size?: string;
}

interface Order {
  id: string;
  orderId: string;
  createdAt: any;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    area: string;
    address: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  status: string;
}

export default function PrintInvoiceBtn({ order }: { order: Order }) {
  const [generating, setGenerating] = useState(false);

  // Helper to load image for PDF
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();

      // 1. ADD LOGO
      try {
        // Load the logo from your public folder
        const logo = await loadImage('/logos/logo.png');
        
        // Calculate aspect ratio to fit nicely (width 40mm)
        const logoWidth = 40;
        const logoHeight = (logo.height * logoWidth) / logo.width;
        
        // Place logo at top center (x=105 is center of A4)
        doc.addImage(logo, 'PNG', 105 - (logoWidth / 2), 10, logoWidth, logoHeight);
        
        // Move text down based on logo height
        var startY = 15 + logoHeight; 
      } catch (e) {
        console.error("Logo failed to load", e);
        var startY = 20; // Fallback if no logo
      }

      // 2. BRAND HEADER
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Premium Pakistani Fashion | Muscat, Oman", 105, startY + 5, { align: "center" });
      
      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(10, startY + 10, 200, startY + 10);

      const contentStart = startY + 25;

      // 3. ORDER DETAILS (Left Side)
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE TO:", 15, contentStart);
      doc.setFont("helvetica", "normal");
      doc.text(`${order.customer.firstName} ${order.customer.lastName}`, 15, contentStart + 7);
      doc.text(`${order.customer.phone}`, 15, contentStart + 13);
      doc.text(`${order.customer.area}`, 15, contentStart + 19);
      
      const splitAddress = doc.splitTextToSize(order.customer.address, 80);
      doc.text(splitAddress, 15, contentStart + 25);

      // 4. INVOICE INFO (Right Side)
      const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString();
      
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE #:", 130, contentStart);
      doc.setFont("helvetica", "normal");
      doc.text(order.orderId, 160, contentStart);

      doc.setFont("helvetica", "bold");
      doc.text("DATE:", 130, contentStart + 7);
      doc.setFont("helvetica", "normal");
      doc.text(dateStr, 160, contentStart + 7);

      doc.setFont("helvetica", "bold");
      doc.text("STATUS:", 130, contentStart + 14);
      doc.setFont("helvetica", "normal");
      doc.text(order.status, 160, contentStart + 14);

      // 5. ITEMS TABLE
      const tableRows = order.items.map(item => [
        `${item.title} (${item.size || 'Std'})`,
        item.quantity,
        `OMR ${item.price.toFixed(3)}`,
        `OMR ${(item.price * item.quantity).toFixed(3)}`
      ]);

      autoTable(doc, {
        startY: contentStart + 45,
        head: [['Item Description', 'Qty', 'Unit Price', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
      });

      // 6. TOTALS SECTION
      // @ts-ignore
      let currentY = doc.lastAutoTable.finalY + 10;

      // Subtotal
      doc.text("Subtotal:", 140, currentY);
      doc.text(`OMR ${order.subtotal.toFixed(3)}`, 195, currentY, { align: "right" });
      currentY += 7;

      // Discount (Red if exists)
      if (order.discount && order.discount > 0) {
        doc.setTextColor(220, 38, 38); 
        doc.text("Discount:", 140, currentY);
        doc.text(`- OMR ${order.discount.toFixed(3)}`, 195, currentY, { align: "right" });
        doc.setTextColor(0, 0, 0);
        currentY += 7;
      }

      // Delivery
      doc.text("Delivery:", 140, currentY);
      doc.text(`OMR ${order.deliveryFee.toFixed(3)}`, 195, currentY, { align: "right" });
      currentY += 10;

      // Final Total
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("TOTAL:", 140, currentY);
      doc.text(`OMR ${order.total.toFixed(3)}`, 195, currentY, { align: "right" });

      // 7. FOOTER
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for choosing Fabricated Fabrics!", 105, 280, { align: "center" });

      // --- OPEN IN NEW TAB ---
      // Instead of .save(), we output a blob URL and open it
      const pdfBlob = doc.output('bloburl');
      window.open(pdfBlob, '_blank');

    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate invoice. Please check logo path.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button 
      onClick={generatePDF}
      disabled={generating}
      className="p-2 bg-gray-100 text-gray-600 rounded-sm hover:bg-brand-dark hover:text-white transition-colors border border-gray-200"
      title="View Invoice"
    >
      {generating ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
    </button>
  );
}