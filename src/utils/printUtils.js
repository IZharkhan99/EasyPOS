import { formatCurrency } from './formatters';

export const printReceipt = (data, businessInfo, settings) => {
  const symbol = settings?.currency_symbol || '$';
  const win = window.open('', '_blank');
  
  const styles = `
    <style>
      body { font-family: 'Courier New', Courier, monospace; padding: 10px; font-size: 13px; width: 300px; color: #000; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; font-size: 11px; text-transform: uppercase; }
      td { padding: 4px 0; vertical-align: top; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-bold { font-weight: bold; }
      .dashed-line { border-bottom: 1px dashed #000; margin: 10px 0; }
      .total-row { border-top: 1px solid #000; margin-top: 5px; padding-top: 5px; }
      .footer { margin-top: 20px; font-size: 11px; }
    </style>
  `;

  const header = `
    <div class="text-center">
      <div class="font-bold" style="font-size: 16px;">${businessInfo?.name || 'EasyPOS'}</div>
      <div style="font-size: 11px;">${businessInfo?.address || ''}</div>
      ${businessInfo?.phone ? `<div style="font-size: 11px;">Tel: ${businessInfo.phone}</div>` : ''}
    </div>
    <div class="dashed-line"></div>
    <div style="font-size: 11px; margin-bottom: 5px;">
      Order: #${String(data.id || 'N/A').slice(-8)}<br/>
      Date: ${data.date || new Date().toLocaleDateString()} ${data.time || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
    </div>
    <div class="dashed-line"></div>
  `;

  const items = `
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Price</th>
        </tr>
      </thead>
      <tbody>
        ${(data.items || []).map(i => `
          <tr>
            <td>${i.name}</td>
            <td class="text-right">${i.quantity}</td>
            <td class="text-right">${formatCurrency(i.price * i.quantity, symbol)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const totals = `
    <div class="dashed-line"></div>
    <div class="text-right">
      <div>Subtotal: ${formatCurrency(data.subtotal, symbol)}</div>
      <div>Tax: ${formatCurrency(data.tax, symbol)}</div>
      <div class="font-bold total-row" style="font-size: 15px;">
        TOTAL: ${formatCurrency(data.total, symbol)}
      </div>
    </div>
    <div class="dashed-line"></div>
    <div style="font-size: 11px;">Payment: ${data.payment_method || 'Cash'}</div>
  `;

  const footer = `
    <div class="text-center footer">
      *** THANK YOU ***<br/>
      Please come again!
    </div>
  `;

  win.document.write(`<html><head>${styles}</head><body>${header}${items}${totals}${footer}</body></html>`);
  win.document.close();
  win.print();
  win.close();
};

export const printStaffPayslip = (staff, businessInfo, settings) => {
  const symbol = settings?.currency_symbol || '$';
  const win = window.open('', '_blank');
  
  const styles = `
    <style>
      body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 13px; width: 350px; }
      .header { text-align: center; margin-bottom: 20px; }
      .section { margin: 15px 0; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
      .row { display: flex; justify-content: space-between; margin: 5px 0; }
      .label { font-weight: bold; }
    </style>
  `;

  const salary = Number(staff.salary || 0);
  const commAmount = Number(staff.commission_amount || 0);
  const commission = salary * (commAmount / 100);

  const content = `
    <div class="header">
      <div style="font-size: 18px; font-weight: bold;">STAFF PAYSLIP</div>
      <div style="font-size: 12px;">${businessInfo?.name || 'EasyPOS'}</div>
    </div>
    
    <div class="section">
      <div class="row"><span class="label">Staff Name:</span> <span>${staff.name}</span></div>
      <div class="row"><span class="label">Position:</span> <span>${staff.role?.toUpperCase()}</span></div>
      <div class="row"><span class="label">Shift:</span> <span>${staff.shift_type}</span></div>
      <div class="row"><span class="label">Date:</span> <span>${new Date().toLocaleDateString()}</span></div>
    </div>

    <div class="section">
      <div class="row"><span class="label">Basic Salary:</span> <span>${formatCurrency(salary, symbol)}</span></div>
      <div class="row"><span class="label">Commission (${commAmount}%):</span> <span>${formatCurrency(commission, symbol)}</span></div>
    </div>

    <div class="row" style="font-size: 16px; font-weight: bold; margin-top: 10px;">
      <span>TOTAL DUE:</span>
      <span>${formatCurrency(salary + commission, symbol)}</span>
    </div>
  `;

  win.document.write(`<html><head>${styles}</head><body>${content}</body></html>`);
  win.document.close();
  win.print();
  win.close();
};

export const printInvoice = (data, businessInfo, settings) => {
  const symbol = settings?.currency_symbol || '$';
  const win = window.open('', '_blank');
  
  const styles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 50px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 30px; }
      .biz-name { font-size: 28px; font-weight: 800; color: #3b82f6; margin-bottom: 5px; }
      .biz-detail { font-size: 13px; color: #64748b; }
      .inv-title { font-size: 32px; font-weight: 900; color: #e2e8f0; text-transform: uppercase; margin-top: -5px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
      .info-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
      .info-value { font-size: 14px; font-weight: 600; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { text-align: left; background: #f8fafc; padding: 12px 15px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
      td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
      .totals-area { margin-left: auto; width: 300px; margin-top: 40px; }
      .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
      .grand-total { border-bottom: none; border-top: 2px solid #3b82f6; margin-top: 10px; padding-top: 15px; font-size: 20px; font-weight: 800; color: #3b82f6; }
      .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 30px; }
    </style>
  `;

  const items = (data.items || []).map(i => `
    <tr>
      <td style="font-weight: 600;">${i.name}</td>
      <td style="text-align: center;">${i.quantity}</td>
      <td style="text-align: right;">${formatCurrency(i.price, symbol)}</td>
      <td style="text-align: right; font-weight: 700;">${formatCurrency(i.price * i.quantity, symbol)}</td>
    </tr>
  `).join('');

  const content = `
    <div class="header">
      <div>
        <div class="biz-name">${businessInfo?.name || 'EasyPOS'}</div>
        <div class="biz-detail">${businessInfo?.address || 'Business Address'}</div>
        <div class="biz-detail">Tel: ${businessInfo?.phone || 'N/A'}</div>
        <div class="biz-detail">Email: ${businessInfo?.email || ''}</div>
      </div>
      <div class="inv-title">Invoice</div>
    </div>

    <div class="info-grid">
      <div>
        <div class="info-label">Billed To</div>
        <div class="info-value" style="font-size: 16px;">${data.customer || 'Walk-in Customer'}</div>
      </div>
      <div style="text-align: right;">
        <div class="info-label">Invoice Details</div>
        <div class="info-value">#${String(data.id || '').slice(-8).toUpperCase()}</div>
        <div class="info-value">${data.date || new Date().toLocaleDateString()}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="total-row">
        <span style="color: #64748b;">Subtotal</span>
        <span style="font-weight: 600;">${formatCurrency(data.subtotal, symbol)}</span>
      </div>
      <div class="total-row">
        <span style="color: #64748b;">Discount</span>
        <span style="color: #ef4444;">-${formatCurrency(data.discount_amount || 0, symbol)}</span>
      </div>
      <div class="total-row">
        <span style="color: #64748b;">Tax</span>
        <span style="font-weight: 600;">${formatCurrency(data.tax || 0, symbol)}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total Amount</span>
        <span>${formatCurrency(data.total, symbol)}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p style="font-size: 10px;">Generated by EasyPOS - Your smart retail solution</p>
    </div>
  `;

  win.document.write(`<html><head><title>Invoice - ${data.id}</title>${styles}</head><body>${content}</body></html>`);
  win.document.close();
  win.print();
};
