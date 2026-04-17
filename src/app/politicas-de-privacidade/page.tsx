export default function PoliticaPrivacidade() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2">
        Política de Privacidade
      </h1>

      <p className="mb-4">
        Esta Política de Privacidade descreve como coletamos, usamos e protegemos
        suas informações ao utilizar nossa loja online de semi-jóias e produtos diversos.
      </p>

      <Section title="1. Coleta de Informações">
        <p>
          Coletamos informações pessoais fornecidas pelo usuário, como nome,
          e-mail, telefone, endereço e dados de pagamento ao realizar uma compra
          ou cadastro em nosso site.
        </p>
      </Section>

      <Section title="2. Uso das Informações">
        <ul className="list-disc ml-6">
          <li>Processar pedidos e entregas</li>
          <li>Melhorar a experiência do usuário</li>
          <li>Enviar comunicações promocionais (com consentimento)</li>
          <li>Atender solicitações e suporte</li>
        </ul>
      </Section>

      <Section title="3. Compartilhamento de Dados">
        <p>
          Não vendemos suas informações pessoais. Podemos compartilhar dados com
          parceiros apenas quando necessário para:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>Processamento de pagamentos</li>
          <li>Entrega de pedidos</li>
          <li>Obrigações legais</li>
        </ul>
      </Section>

      <Section title="4. Armazenamento e Segurança">
        <p>
          Adotamos medidas de segurança para proteger seus dados contra acesso
          não autorizado, alteração ou divulgação indevida.
        </p>
      </Section>

      <Section title="5. Cookies">
        <p>
          Utilizamos cookies para melhorar a navegação, personalizar conteúdo e
          analisar o tráfego do site.
        </p>
      </Section>

      <Section title="6. Direitos do Usuário (LGPD)">
        <p>Você pode, a qualquer momento:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Acessar seus dados</li>
          <li>Corrigir informações incorretas</li>
          <li>Solicitar exclusão de dados</li>
          <li>Revogar consentimentos</li>
        </ul>
      </Section>

      <Section title="7. Retenção de Dados">
        <p>
          Mantemos seus dados apenas pelo tempo necessário para cumprir as
          finalidades descritas, salvo obrigações legais.
        </p>
      </Section>

      <Section title="8. Alterações na Política">
        <p>
          Esta política pode ser atualizada periodicamente. Recomendamos a
          revisão frequente.
        </p>
      </Section>

      <Section title="9. Contato">
        <p>
          Em caso de dúvidas ou solicitações relacionadas à privacidade, entre em contato:
        </p>
        <p className="mt-2 font-medium">contato@sualoja.com</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}