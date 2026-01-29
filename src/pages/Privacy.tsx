import { Layout } from '@/components/layout/Layout';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Правовая информация
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Политика конфиденциальности</h1>
          <p className="text-muted-foreground">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Общие положения</h2>
            <p className="text-muted-foreground mb-4">
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки
              и защиты персональных данных пользователей платформы KazAfisha (далее — «Платформа», «мы»).
            </p>
            <p className="text-muted-foreground mb-4">
              Используя Платформу, вы соглашаетесь с условиями данной Политики. Если вы не согласны
              с какими-либо положениями, пожалуйста, прекратите использование Платформы.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Какие данные мы собираем</h2>
            <p className="text-muted-foreground mb-4">Мы можем собирать следующие категории данных:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Регистрационные данные:</strong> имя, адрес электронной почты, номер телефона</li>
              <li><strong>Данные профиля:</strong> фотография, город проживания, предпочтения по категориям событий</li>
              <li><strong>Данные бизнеса:</strong> название организации, БИН/ИИН, контактные данные, описание деятельности</li>
              <li><strong>Данные об использовании:</strong> просмотренные страницы, клики, сохранённые события</li>
              <li><strong>Технические данные:</strong> IP-адрес, тип браузера, операционная система, данные cookies</li>
              <li><strong>Платёжные данные:</strong> информация о транзакциях (без хранения данных банковских карт)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Цели обработки данных</h2>
            <p className="text-muted-foreground mb-4">Мы используем ваши данные для:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Предоставления доступа к функциям Платформы</li>
              <li>Персонализации контента и рекомендаций</li>
              <li>Обработки платежей и начисления кэшбэка</li>
              <li>Связи с вами по вопросам использования сервиса</li>
              <li>Отправки уведомлений о событиях и акциях (с вашего согласия)</li>
              <li>Улучшения качества Платформы и аналитики</li>
              <li>Обеспечения безопасности и предотвращения мошенничества</li>
              <li>Выполнения требований законодательства Республики Казахстан</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Правовые основания обработки</h2>
            <p className="text-muted-foreground mb-4">Мы обрабатываем данные на следующих основаниях:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Договор:</strong> для исполнения условий пользовательского соглашения</li>
              <li><strong>Согласие:</strong> для маркетинговых рассылок и персонализированной рекламы</li>
              <li><strong>Законный интерес:</strong> для улучшения сервиса и обеспечения безопасности</li>
              <li><strong>Юридическая обязанность:</strong> для выполнения требований законодательства</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Передача данных третьим лицам</h2>
            <p className="text-muted-foreground mb-4">
              Мы не продаём ваши персональные данные. Мы можем передавать данные:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Партнёрам-организаторам:</strong> при регистрации на мероприятие — контактные данные для связи</li>
              <li><strong>Платёжным провайдерам:</strong> для обработки транзакций</li>
              <li><strong>Аналитическим сервисам:</strong> обезличенные данные для улучшения Платформы</li>
              <li><strong>Государственным органам:</strong> по запросу в соответствии с законодательством РК</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Хранение данных</h2>
            <p className="text-muted-foreground mb-4">
              Мы храним персональные данные в течение срока действия вашей учётной записи
              и дополнительно 3 года после её удаления для выполнения юридических обязательств.
            </p>
            <p className="text-muted-foreground mb-4">
              Данные хранятся на защищённых серверах с использованием современных методов шифрования.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Ваши права</h2>
            <p className="text-muted-foreground mb-4">В соответствии с законодательством РК вы имеете право:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Получить информацию о хранящихся данных</li>
              <li>Исправить неточные данные</li>
              <li>Удалить свои данные (с учётом законных ограничений)</li>
              <li>Отозвать согласие на обработку данных</li>
              <li>Отказаться от маркетинговых рассылок</li>
              <li>Подать жалобу в уполномоченный орган по защите персональных данных</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Для реализации своих прав обратитесь к нам по адресу: privacy@kazafisha.kz
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Файлы cookies</h2>
            <p className="text-muted-foreground mb-4">
              Мы используем cookies для обеспечения работы Платформы, аналитики и персонализации.
              Вы можете управлять cookies в настройках браузера.
            </p>
            <p className="text-muted-foreground mb-4">Типы используемых cookies:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Необходимые:</strong> для работы авторизации и основных функций</li>
              <li><strong>Аналитические:</strong> для понимания использования Платформы</li>
              <li><strong>Функциональные:</strong> для сохранения ваших предпочтений</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Безопасность данных</h2>
            <p className="text-muted-foreground mb-4">
              Мы применяем технические и организационные меры для защиты ваших данных:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Шифрование данных при передаче (SSL/TLS)</li>
              <li>Защищённое хранение паролей (хеширование)</li>
              <li>Разграничение доступа сотрудников</li>
              <li>Регулярный аудит безопасности</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Изменения Политики</h2>
            <p className="text-muted-foreground mb-4">
              Мы можем обновлять данную Политику. О существенных изменениях мы уведомим вас
              по электронной почте или через уведомление на Платформе. Продолжение использования
              Платформы после изменений означает согласие с обновлённой Политикой.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Контактная информация</h2>
            <p className="text-muted-foreground mb-4">
              По вопросам обработки персональных данных обращайтесь:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li><strong>Email:</strong> privacy@kazafisha.kz</li>
              <li><strong>Телефон:</strong> +7 (700) 123-45-67</li>
              <li><strong>Адрес:</strong> Республика Казахстан</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
