// html2pdf is loaded via CDN in index.html
// Access it as window.html2pdf

const invoiceGenerator = {
  /**
   * Generate and download invoice PDF
   * @param {Object} bookingData - Booking details object
   * @param {string} bookingData.bookingNumber - Booking reference number
   * @param {string} bookingData.venueName - Name of the venue
   * @param {string} bookingData.date - Booking date
   * @param {string} bookingData.slotTime - Time slot (e.g., "10:00 AM - 2:00 PM")
   * @param {number} bookingData.amount - Booking amount
   * @param {string} bookingData.userEmail - User's email
   * @param {number} bookingData.discount - Discount amount (optional)
   * @param {string} bookingData.couponCode - Coupon code used (optional)
   * @returns {Promise}
   */
  generateInvoice: async (bookingData) => {
    const {
      bookingNumber,
      venueName,
      date,
      slotTime,
      amount,
      userEmail,
      discount = 0,
      couponCode = '',
    } = bookingData;

    // Validate html2pdf availability first
    if (!window.html2pdf) {
      console.error('[invoiceGenerator] html2pdf library not loaded');
      return { success: false, message: 'PDF generation library not available' };
    }

    try {
      // Convert to numbers to ensure .toFixed() works
      const numAmount = parseFloat(amount) || 0;
      const numDiscount = parseFloat(discount) || 0;
      const finalAmount = numAmount - numDiscount;
      
      const invoiceDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px;">
          <!-- Invoice Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px;">
            <h1 style="margin: 0; color: #667eea; font-size: 32px;">INVOICE</h1>
            <p style="margin: 5px 0; color: #666;">Booking Confirmation & Receipt</p>
          </div>

          <!-- Company & Booking Details Row -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <!-- Company Info -->
            <div>
              <h3 style="margin: 0 0 10px 0; color: #333;">MultiSport</h3>
              <p style="margin: 5px 0; color: #666; font-size: 12px;">Sports Venue Booking Platform</p>
              <p style="margin: 5px 0; color: #666; font-size: 12px;">Email: support@multisport.com</p>
            </div>

            <!-- Invoice Meta Info -->
            <div style="text-align: right;">
              <p style="margin: 5px 0; color: #666; font-size: 12px;">
                <strong>Invoice Date:</strong> ${invoiceDate}
              </p>
              <p style="margin: 5px 0; color: #666; font-size: 12px;">
                <strong>Booking ID:</strong> ${bookingNumber}
              </p>
            </div>
          </div>

          <!-- Bill To Section -->
          <div style="margin-bottom: 30px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">BILL TO:</h4>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">Customer Email: ${userEmail}</p>
          </div>

          <!-- Booking Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #667eea; color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border: 1px solid #ddd;">
                <td style="padding: 12px;">Venue Name</td>
                <td style="padding: 12px; color: #333;"><strong>${venueName}</strong></td>
              </tr>
              <tr style="background-color: #f9f9f9; border: 1px solid #ddd;">
                <td style="padding: 12px;">Booking Date</td>
                <td style="padding: 12px; color: #333;">${date}</td>
              </tr>
              <tr style="border: 1px solid #ddd;">
                <td style="padding: 12px;">Time Slot</td>
                <td style="padding: 12px; color: #333;">${slotTime}</td>
              </tr>
              <tr style="background-color: #f9f9f9; border: 1px solid #ddd;">
                <td style="padding: 12px;">Booking Number</td>
                <td style="padding: 12px; color: #333;">#${bookingNumber}</td>
              </tr>
            </tbody>
          </table>

          <!-- Price Summary -->
          <div style="width: 100%; max-width: 400px; margin-left: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px 0; color: #666;">Booking Amount:</td>
                <td style="padding: 10px 0; text-align: right; color: #333;">₹${numAmount.toFixed(2)}</td>
              </tr>
              ${numDiscount > 0 ? `
              <tr style="border-bottom: 1px solid #ddd; background-color: #f0f7ff;">
                <td style="padding: 10px 0; color: #27ae60;">Discount (${couponCode}):</td>
                <td style="padding: 10px 0; text-align: right; color: #27ae60; font-weight: bold;">-₹${numDiscount.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="background-color: #667eea; color: white;">
                <td style="padding: 12px 0; font-weight: bold;">TOTAL AMOUNT:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px;">₹${finalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 11px;">
            <p style="margin: 5px 0;">Thank you for booking with MultiSport!</p>
            <p style="margin: 5px 0;">This is a computer-generated invoice. No signature is required.</p>
            <p style="margin: 5px 0; margin-top: 10px; color: #999;">For support, contact us at support@multisport.com</p>
          </div>
        </div>
      `;

      const options = {
        margin: [10, 10, 10, 10],
        filename: `Invoice_${bookingNumber}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, allowTaint: true },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      };

      console.log('[invoiceGenerator] Starting PDF generation for booking:', bookingNumber);

      return new Promise((resolve) => {
        try {
          const worker = window.html2pdf();
          
          worker
            .set(options)
            .from(element)
            .save()
            .then(() => {
              console.log('[invoiceGenerator] ✅ Invoice PDF generated and saved successfully');
              resolve({ success: true, message: 'Invoice downloaded successfully' });
            })
            .catch((pdfError) => {
              console.error('[invoiceGenerator] ❌ PDF generation error:', pdfError);
              resolve({ success: false, message: `PDF generation failed: ${pdfError.message}` });
            });
        } catch (err) {
          console.error('[invoiceGenerator] ❌ Exception during PDF generation:', err);
          resolve({ success: false, message: `Error during PDF generation: ${err.message}` });
        }
      });
    } catch (error) {
      console.error('[invoiceGenerator] ❌ Error preparing invoice:', error);
      return { success: false, message: `Failed to prepare invoice: ${error.message}` };
    }
  },

  /**
   * Generate invoice as HTML (for preview)
   * @param {Object} bookingData - Booking details object
   * @returns {string} HTML string
   */
  generateInvoiceHTML: (bookingData) => {
    const {
      bookingNumber,
      venueName,
      date,
      slotTime,
      amount,
      userEmail,
      discount = 0,
      couponCode = '',
    } = bookingData;

    // Convert to numbers to ensure .toFixed() works
    const numAmount = parseFloat(amount) || 0;
    const numDiscount = parseFloat(discount) || 0;
    const finalAmount = numAmount - numDiscount;
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px;">
        <!-- Invoice Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px;">
          <h1 style="margin: 0; color: #667eea; font-size: 32px;">INVOICE</h1>
          <p style="margin: 5px 0; color: #666;">Booking Confirmation & Receipt</p>
        </div>

        <!-- Company & Booking Details Row -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <!-- Company Info -->
          <div>
            <h3 style="margin: 0 0 10px 0; color: #333;">MultiSport</h3>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">Sports Venue Booking Platform</p>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">Email: support@multisport.com</p>
          </div>

          <!-- Invoice Meta Info -->
          <div style="text-align: right;">
            <p style="margin: 5px 0; color: #666; font-size: 12px;">
              <strong>Invoice Date:</strong> ${invoiceDate}
            </p>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">
              <strong>Booking ID:</strong> ${bookingNumber}
            </p>
          </div>
        </div>

        <!-- Bill To Section -->
        <div style="margin-bottom: 30px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">BILL TO:</h4>
          <p style="margin: 5px 0; color: #666; font-size: 12px;">Customer Email: ${userEmail}</p>
        </div>

        <!-- Booking Details Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border: 1px solid #ddd;">
              <td style="padding: 12px;">Venue Name</td>
              <td style="padding: 12px; color: #333;"><strong>${venueName}</strong></td>
            </tr>
            <tr style="background-color: #f9f9f9; border: 1px solid #ddd;">
              <td style="padding: 12px;">Booking Date</td>
              <td style="padding: 12px; color: #333;">${date}</td>
            </tr>
            <tr style="border: 1px solid #ddd;">
              <td style="padding: 12px;">Time Slot</td>
              <td style="padding: 12px; color: #333;">${slotTime}</td>
            </tr>
            <tr style="background-color: #f9f9f9; border: 1px solid #ddd;">
              <td style="padding: 12px;">Booking Number</td>
              <td style="padding: 12px; color: #333;">#${bookingNumber}</td>
            </tr>
          </tbody>
        </table>

        <!-- Price Summary -->
        <div style="width: 100%; max-width: 400px; margin-left: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px 0; color: #666;">Booking Amount:</td>
              <td style="padding: 10px 0; text-align: right; color: #333;">₹${numAmount.toFixed(2)}</td>
            </tr>
            ${numDiscount > 0 ? `
            <tr style="border-bottom: 1px solid #ddd; background-color: #f0f7ff;">
              <td style="padding: 10px 0; color: #27ae60;">Discount (${couponCode}):</td>
              <td style="padding: 10px 0; text-align: right; color: #27ae60; font-weight: bold;">-₹${numDiscount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr style="background-color: #667eea; color: white;">
              <td style="padding: 12px 0; font-weight: bold;">TOTAL AMOUNT:</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px;">₹${finalAmount.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 11px;">
          <p style="margin: 5px 0;">Thank you for booking with MultiSport!</p>
          <p style="margin: 5px 0;">This is a computer-generated invoice. No signature is required.</p>
          <p style="margin: 5px 0; margin-top: 10px; color: #999;">For support, contact us at support@multisport.com</p>
        </div>
      </div>
    `;
  },
};

export default invoiceGenerator;
