// Email service using Resend API
// Configuration via environment variables: RESEND_API_KEY

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Get Resend config from environment
function getResendConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'Afisha.kz <noreply@afisha.kz>',
    fromName: process.env.EMAIL_FROM_NAME || 'Afisha.kz',
  };
}

// Check if email service is configured
export function isEmailConfigured(): boolean {
  const config = getResendConfig();
  return !!config.apiKey;
}

// Send email via Resend API
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const config = getResendConfig();

  if (!config.apiKey) {
    console.warn('RESEND_API_KEY not configured, email not sent');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || config.fromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Email Templates
// ============================================

// Base email template wrapper
function emailTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%); padding: 30px; text-align: center; }
    .header h1 { color: #1a1a1a; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #D4AF37; color: #1a1a1a !important; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #1a1a1a; color: #999; padding: 20px; text-align: center; font-size: 12px; }
    .footer a { color: #D4AF37; }
    .info-box { background: #f8f9fa; border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Afisha.kz</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Afisha.kz — Афиша событий Казахстана</p>
      <p><a href="https://afisha.kz">afisha.kz</a></p>
    </div>
  </div>
</body>
</html>`;
}

// Welcome email for new users
export async function sendWelcomeEmail(to: string, name?: string): Promise<EmailResult> {
  const displayName = name || 'пользователь';

  const html = emailTemplate(`
    <h2>Добро пожаловать на Afisha.kz!</h2>
    <p>Здравствуйте, ${displayName}!</p>
    <p>Спасибо за регистрацию на нашей платформе. Теперь вы можете:</p>
    <ul>
      <li>Находить интересные события в вашем городе</li>
      <li>Сохранять избранные мероприятия</li>
      <li>Получать уведомления о новых событиях</li>
      <li>Использовать скидки и акции от местного бизнеса</li>
    </ul>
    <a href="https://afisha.kz" class="button">Начать исследовать</a>
    <p>Если у вас есть вопросы, просто ответьте на это письмо.</p>
  `, 'Добро пожаловать на Afisha.kz');

  return sendEmail({
    to,
    subject: 'Добро пожаловать на Afisha.kz! 🎉',
    html,
    text: `Здравствуйте, ${displayName}! Спасибо за регистрацию на Afisha.kz.`,
  });
}

// Business registration confirmation
export async function sendBusinessRegistrationEmail(
  to: string,
  businessName: string
): Promise<EmailResult> {
  const html = emailTemplate(`
    <h2>Ваш бизнес зарегистрирован!</h2>
    <p>Поздравляем! Бизнес <strong>"${businessName}"</strong> успешно зарегистрирован на Afisha.kz.</p>
    <div class="info-box">
      <p><strong>Что дальше?</strong></p>
      <ul>
        <li>Ваш профиль будет проверен нашими модераторами</li>
        <li>После верификации вы сможете публиковать события и акции</li>
        <li>Рассмотрите Premium-тариф для дополнительных возможностей</li>
      </ul>
    </div>
    <a href="https://afisha.kz/business" class="button">Перейти в кабинет</a>
  `, 'Бизнес зарегистрирован');

  return sendEmail({
    to,
    subject: `Бизнес "${businessName}" зарегистрирован на Afisha.kz`,
    html,
    text: `Поздравляем! Бизнес "${businessName}" успешно зарегистрирован на Afisha.kz.`,
  });
}

// Business verification notification
export async function sendBusinessVerifiedEmail(
  to: string,
  businessName: string
): Promise<EmailResult> {
  const html = emailTemplate(`
    <h2>Ваш бизнес верифицирован! ✅</h2>
    <p>Отличные новости! Бизнес <strong>"${businessName}"</strong> прошел проверку и получил статус верифицированного.</p>
    <p>Теперь ваш профиль отмечен галочкой верификации, что повышает доверие пользователей.</p>
    <a href="https://afisha.kz/business" class="button">Перейти в кабинет</a>
  `, 'Бизнес верифицирован');

  return sendEmail({
    to,
    subject: `✅ Бизнес "${businessName}" верифицирован`,
    html,
    text: `Отличные новости! Бизнес "${businessName}" прошел проверку и получил статус верифицированного.`,
  });
}

// Event approved notification
export async function sendEventApprovedEmail(
  to: string,
  eventTitle: string,
  eventId: string
): Promise<EmailResult> {
  const html = emailTemplate(`
    <h2>Событие одобрено! 🎉</h2>
    <p>Ваше событие <strong>"${eventTitle}"</strong> прошло модерацию и теперь опубликовано на Afisha.kz.</p>
    <p>Пользователи платформы уже могут его видеть и добавлять в избранное.</p>
    <a href="https://afisha.kz/events/${eventId}" class="button">Посмотреть событие</a>
  `, 'Событие одобрено');

  return sendEmail({
    to,
    subject: `🎉 Событие "${eventTitle}" опубликовано`,
    html,
    text: `Ваше событие "${eventTitle}" прошло модерацию и теперь опубликовано на Afisha.kz.`,
  });
}

// Event rejected notification
export async function sendEventRejectedEmail(
  to: string,
  eventTitle: string,
  reason?: string
): Promise<EmailResult> {
  const html = emailTemplate(`
    <h2>Событие не прошло модерацию</h2>
    <p>К сожалению, событие <strong>"${eventTitle}"</strong> не было одобрено.</p>
    ${reason ? `
    <div class="info-box">
      <p><strong>Причина:</strong></p>
      <p>${reason}</p>
    </div>
    ` : ''}
    <p>Вы можете отредактировать событие и отправить на повторную модерацию.</p>
    <a href="https://afisha.kz/business/events" class="button">Редактировать события</a>
  `, 'Событие отклонено');

  return sendEmail({
    to,
    subject: `Событие "${eventTitle}" не прошло модерацию`,
    html,
    text: `К сожалению, событие "${eventTitle}" не было одобрено.${reason ? ` Причина: ${reason}` : ''}`,
  });
}

// Team invitation email
export async function sendTeamInvitationEmail(
  to: string,
  businessName: string,
  inviterName: string,
  role: string
): Promise<EmailResult> {
  const roleNames: Record<string, string> = {
    admin: 'Администратор',
    editor: 'Редактор',
    viewer: 'Наблюдатель',
  };

  const html = emailTemplate(`
    <h2>Приглашение в команду</h2>
    <p><strong>${inviterName}</strong> приглашает вас присоединиться к команде бизнеса <strong>"${businessName}"</strong> на Afisha.kz.</p>
    <div class="info-box">
      <p><strong>Ваша роль:</strong> ${roleNames[role] || role}</p>
    </div>
    <p>Чтобы принять приглашение, войдите в свой аккаунт на Afisha.kz.</p>
    <a href="https://afisha.kz/auth" class="button">Войти на Afisha.kz</a>
  `, 'Приглашение в команду');

  return sendEmail({
    to,
    subject: `Приглашение в команду "${businessName}"`,
    html,
    text: `${inviterName} приглашает вас присоединиться к команде бизнеса "${businessName}" на Afisha.kz. Ваша роль: ${roleNames[role] || role}.`,
  });
}

// Password changed notification
export async function sendPasswordChangedEmail(to: string, name?: string): Promise<EmailResult> {
  const displayName = name || 'пользователь';

  const html = emailTemplate(`
    <h2>Пароль изменен</h2>
    <p>Здравствуйте, ${displayName}!</p>
    <p>Ваш пароль на Afisha.kz был успешно изменен.</p>
    <div class="info-box">
      <p><strong>Это были не вы?</strong></p>
      <p>Если вы не меняли пароль, немедленно свяжитесь с нашей поддержкой.</p>
    </div>
  `, 'Пароль изменен');

  return sendEmail({
    to,
    subject: '🔐 Пароль на Afisha.kz изменен',
    html,
    text: `Здравствуйте, ${displayName}! Ваш пароль на Afisha.kz был успешно изменен.`,
  });
}

// Subscription upgrade notification
export async function sendSubscriptionUpgradeEmail(
  to: string,
  businessName: string,
  tier: string
): Promise<EmailResult> {
  const tierNames: Record<string, string> = {
    lite: 'Lite (10 публикаций/мес)',
    premium: 'Premium (безлимит + баннер + команда)',
  };

  const html = emailTemplate(`
    <h2>Подписка обновлена! 🚀</h2>
    <p>Поздравляем! Тариф для бизнеса <strong>"${businessName}"</strong> успешно обновлен.</p>
    <div class="info-box">
      <p><strong>Новый тариф:</strong> ${tierNames[tier] || tier}</p>
    </div>
    <p>Теперь вам доступны новые возможности. Начните использовать их прямо сейчас!</p>
    <a href="https://afisha.kz/business" class="button">Перейти в кабинет</a>
  `, 'Подписка обновлена');

  return sendEmail({
    to,
    subject: `🚀 Тариф для "${businessName}" обновлен`,
    html,
    text: `Поздравляем! Тариф для бизнеса "${businessName}" успешно обновлен до ${tierNames[tier] || tier}.`,
  });
}
