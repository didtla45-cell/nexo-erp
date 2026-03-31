import { supabase } from "./supabase";

export interface EmailPayload {
  recipientEmail: string;
  customerName: string;
  quotationNumber: string;
  quotationId: string;
  amount: number;
  dealTitle: string;
}

/**
 * NEXO ERP Email & Notification Service
 * Handles sending simulated emails and triggering team-wide notifications.
 */
export const emailService = {
  /**
   * Simulates sending an email with a PDF quotation.
   * In a real production app, this would call Resend, SendGrid, or a private API.
   */
  async sendQuotationEmail(payload: EmailPayload, companyId: string) {
    console.log(`[NEXO EMAIL SERVICE] Sending email to: ${payload.recipientEmail}...`);
    
    // 1. Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Generate a Public View URL (Simulated)
    const publicUrl = `${window.location.origin}/public/quotation/${payload.quotationId}`;
    
    // 3. Log to Database
    try {
      await supabase
        .from("erp_email_logs")
        .insert({
          company_id: companyId,
          quotation_id: payload.quotationId,
          recipient_email: payload.recipientEmail,
          subject: `${payload.customerName} - 견적서 발송 (${payload.quotationNumber})`,
          status: 'Sent'
        });
    } catch (err) {
      console.warn("Email log failed to save, but email was 'sent'.");
    }

    // 4. Trigger Internal Team Notifications
    await this.notifyTeams(payload, companyId);
    
    // 5. Simulate first view after 5 seconds (Optional for demo)
    setTimeout(() => this.notifyOwnerOnView(payload, companyId), 5000);

    return { success: true, message: "이메일과 PDF가 성공적으로 발송되었습니다.", publicUrl };
  },

  /**
   * Notifies the Sales and Accounting teams about the sent quotation.
   */
  async notifyTeams(payload: EmailPayload, companyId: string) {
    try {
      const notifications = [
        {
          company_id: companyId,
          target_role: 'sales',
          title: '📢 신규 견적서 발송 알림',
          message: `${payload.customerName}님께 ${payload.quotationNumber} 견적서가 발송되었습니다.`,
          type: 'quotation',
          link: '/dashboard/quotations'
        },
        {
          company_id: companyId,
          target_role: 'accounting',
          title: '💰 매출 예상 알림',
          message: `${payload.customerName} 견적 발송 완료: ₩${payload.amount.toLocaleString()} 가망 매출`,
          type: 'success',
          link: '/dashboard/quotations'
        }
      ];

      const { error } = await supabase
        .from("erp_notifications")
        .insert(notifications);

      if (error) throw error;
    } catch (err) {
      console.warn("[NEXO NOTIFICATION SYSTEM] erp_notifications table not found. Please run the SQL setup script.");
    }
  },

  async notifyOwnerOnView(payload: EmailPayload, companyId: string) {
    try {
      const { error } = await supabase
        .from("erp_notifications")
        .insert({
          company_id: companyId,
          target_role: 'owner',
          title: '👀 견적서 조회 알림',
          message: `${payload.customerName} 담당자님이 견적서를 확인하셨습니다! ✨`,
          type: 'info',
          link: '/dashboard/quotations'
        });

      if (error) throw error;
    } catch (err) {
      console.warn("[NEXO NOTIFICATION SYSTEM] Notification suppressed: Table missing.");
    }
  }
};
