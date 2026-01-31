import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { FileText } from 'lucide-react';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Правовая информация
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Пользовательское соглашение</h1>
          <p className="text-muted-foreground">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Общие положения</h2>
            <p className="text-muted-foreground mb-4">
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между
              владельцем платформы KazAfisha (далее — «Платформа», «Администрация») и пользователем
              сети Интернет (далее — «Пользователь»).
            </p>
            <p className="text-muted-foreground mb-4">
              Платформа KazAfisha — информационный сервис, предоставляющий возможность размещения
              и поиска информации о событиях, акциях, бизнесах и сообществах в городах Казахстана.
            </p>
            <p className="text-muted-foreground mb-4">
              Использование Платформы означает полное и безоговорочное согласие Пользователя с условиями
              настоящего Соглашения.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Регистрация и учётная запись</h2>
            <p className="text-muted-foreground mb-4">
              2.1. Для доступа к расширенным функциям Платформы требуется регистрация учётной записи.
            </p>
            <p className="text-muted-foreground mb-4">
              2.2. При регистрации Пользователь обязуется предоставить достоверную информацию о себе.
            </p>
            <p className="text-muted-foreground mb-4">
              2.3. Пользователь несёт ответственность за сохранность своих учётных данных и все действия,
              совершённые с использованием его учётной записи.
            </p>
            <p className="text-muted-foreground mb-4">
              2.4. Пользователь обязуется немедленно уведомить Администрацию о несанкционированном
              доступе к учётной записи.
            </p>
            <p className="text-muted-foreground mb-4">
              2.5. Администрация вправе отказать в регистрации или заблокировать учётную запись
              без объяснения причин.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Права и обязанности Пользователя</h2>
            <p className="text-muted-foreground mb-4">3.1. Пользователь имеет право:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Просматривать информацию о событиях, акциях и бизнесах</li>
              <li>Регистрироваться на мероприятия и получать уведомления</li>
              <li>Сохранять избранные события и бизнесы</li>
              <li>Участвовать в программе кэшбэка и реферальной программе</li>
              <li>Размещать контент в соответствии с правилами Платформы</li>
            </ul>
            <p className="text-muted-foreground mb-4">3.2. Пользователь обязуется:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Соблюдать законодательство Республики Казахстан</li>
              <li>Не нарушать права третьих лиц</li>
              <li>Не размещать запрещённый контент</li>
              <li>Не использовать Платформу для рассылки спама</li>
              <li>Не предпринимать действий, нарушающих работу Платформы</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Правила для бизнес-аккаунтов</h2>
            <p className="text-muted-foreground mb-4">
              4.1. Регистрация бизнес-аккаунта требует верификации данных организации.
            </p>
            <p className="text-muted-foreground mb-4">
              4.2. Владелец бизнес-аккаунта гарантирует наличие полномочий действовать от имени организации.
            </p>
            <p className="text-muted-foreground mb-4">
              4.3. Размещаемая информация о событиях, акциях и услугах должна быть достоверной и актуальной.
            </p>
            <p className="text-muted-foreground mb-4">
              4.4. Запрещается размещение вводящей в заблуждение информации о ценах, скидках и условиях акций.
            </p>
            <p className="text-muted-foreground mb-4">
              4.5. Администрация вправе модерировать и удалять контент без предварительного уведомления.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Запрещённый контент</h2>
            <p className="text-muted-foreground mb-4">На Платформе запрещено размещение:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Материалов, нарушающих законодательство РК</li>
              <li>Контента, пропагандирующего насилие, ненависть или дискриминацию</li>
              <li>Материалов порнографического характера</li>
              <li>Информации о незаконных товарах и услугах</li>
              <li>Персональных данных третьих лиц без их согласия</li>
              <li>Вредоносного программного обеспечения</li>
              <li>Материалов, нарушающих авторские права</li>
              <li>Ложной или вводящей в заблуждение информации</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Интеллектуальная собственность</h2>
            <p className="text-muted-foreground mb-4">
              6.1. Все материалы Платформы (дизайн, логотипы, тексты, программный код) являются
              интеллектуальной собственностью Администрации.
            </p>
            <p className="text-muted-foreground mb-4">
              6.2. Пользователь сохраняет права на размещённый им контент, предоставляя Администрации
              неисключительную лицензию на его использование в рамках работы Платформы.
            </p>
            <p className="text-muted-foreground mb-4">
              6.3. Копирование материалов Платформы без письменного разрешения запрещено.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Платные услуги</h2>
            <p className="text-muted-foreground mb-4">
              7.1. Часть функций Платформы предоставляется на платной основе (подписки, реклама, продвижение).
            </p>
            <p className="text-muted-foreground mb-4">
              7.2. Стоимость услуг указана на странице тарифов. Администрация вправе изменять цены
              с предварительным уведомлением.
            </p>
            <p className="text-muted-foreground mb-4">
              7.3. Оплата производится через сертифицированных платёжных провайдеров.
            </p>
            <p className="text-muted-foreground mb-4">
              7.4. Возврат средств осуществляется в соответствии с законодательством РК и политикой возврата.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Программа кэшбэка</h2>
            <p className="text-muted-foreground mb-4">
              8.1. Условия программы кэшбэка определяются отдельным положением, размещённым на Платформе.
            </p>
            <p className="text-muted-foreground mb-4">
              8.2. Администрация вправе изменять условия программы с уведомлением пользователей.
            </p>
            <p className="text-muted-foreground mb-4">
              8.3. Начисленный кэшбэк не является денежными средствами и может быть использован
              только в соответствии с правилами программы.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Ограничение ответственности</h2>
            <p className="text-muted-foreground mb-4">
              9.1. Платформа предоставляется «как есть». Администрация не гарантирует бесперебойную работу сервиса.
            </p>
            <p className="text-muted-foreground mb-4">
              9.2. Администрация не несёт ответственности за:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Качество мероприятий и услуг, размещённых на Платформе</li>
              <li>Действия организаторов событий и владельцев бизнесов</li>
              <li>Убытки, возникшие в результате использования Платформы</li>
              <li>Технические сбои и потерю данных</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              9.3. Пользователь использует Платформу на свой риск и самостоятельно несёт ответственность
              за свои действия.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Разрешение споров</h2>
            <p className="text-muted-foreground mb-4">
              10.1. Споры разрешаются путём переговоров. При недостижении согласия — в судебном порядке
              по месту нахождения Администрации в соответствии с законодательством Республики Казахстан.
            </p>
            <p className="text-muted-foreground mb-4">
              10.2. Претензионный порядок обязателен. Срок рассмотрения претензии — 30 дней.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Изменение Соглашения</h2>
            <p className="text-muted-foreground mb-4">
              11.1. Администрация вправе изменять условия Соглашения в одностороннем порядке.
            </p>
            <p className="text-muted-foreground mb-4">
              11.2. Изменения вступают в силу с момента публикации на Платформе.
            </p>
            <p className="text-muted-foreground mb-4">
              11.3. Продолжение использования Платформы после внесения изменений означает согласие
              с новой редакцией Соглашения.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Заключительные положения</h2>
            <p className="text-muted-foreground mb-4">
              12.1. Настоящее Соглашение составлено на русском языке и регулируется законодательством
              Республики Казахстан.
            </p>
            <p className="text-muted-foreground mb-4">
              12.2. Если какое-либо положение Соглашения признано недействительным, остальные положения
              сохраняют силу.
            </p>
            <p className="text-muted-foreground mb-4">
              12.3. Неиспользование Администрацией какого-либо права не означает отказ от него.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Контактная информация</h2>
            <p className="text-muted-foreground mb-4">
              По вопросам, связанным с настоящим Соглашением, обращайтесь:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li><strong>Email:</strong> legal@kazafisha.kz</li>
              <li><strong>Телефон:</strong> +7 (700) 123-45-67</li>
              <li><strong>Адрес:</strong> Республика Казахстан</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
