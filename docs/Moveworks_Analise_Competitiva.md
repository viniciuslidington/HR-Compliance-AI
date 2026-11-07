# Moveworks — análise competitiva e referência de engenharia

**Consulta: 7 de novembro de 2026.** Pesquisa de materiais públicos primários de Moveworks, ServiceNow e listagem publicada pelo fornecedor na AWS Marketplace. Sem acesso ao produto, teste de integrações ou validação independente dos resultados comerciais. As recomendações abaixo são análise, não descrições de capacidades já existentes no nosso produto.

## Conclusão para nosso posicionamento

**Análise:** a Moveworks é uma concorrente adjacente e uma plataforma que pode permitir construir soluções substitutas. A categoria predominante é assistência empresarial, busca e execução de solicitações entre sistemas. Nosso recorte proposto é investigação de obrigações trabalhistas brasileiras: ponto × folha × compensações, com regras versionadas, evidências e correção verificável. A proximidade técnica é significativa, mas não comprova engenharia idêntica ou equivalência de cobertura.

O risco de competição aumenta se nossa entrega ficar limitada a chat sobre políticas, busca de documentos, abertura de tickets e acompanhamento de tarefas. Uma hipótese de diferenciação mais defensável é entregar uma investigação trabalhista especializada, reproduzível e útil ao DP e jurídico. Não foi comprovada ausência dessa cobertura na Moveworks; ausência de descrição pública não equivale a ausência de capacidade.

## Empresa e situação corporativa

A aquisição pela ServiceNow foi **concluída em 15 de dezembro de 2025**. O comunicado descreve a combinação do assistente, busca empresarial e Reasoning Engine da Moveworks com workflows e governança da ServiceNow. Portanto, em novembro de 2026, a comparação deve considerar sua posição dentro do portfólio ServiceNow. [ServiceNow — conclusão da aquisição](https://newsroom.servicenow.com/press-releases/details/2025/ServiceNow-completes-acquisition-of-Moveworks/default.aspx).

Em 26/02/2026, a ServiceNow anunciou EmployeeWorks como disponível comercialmente, combinando chat e busca Moveworks com portal e workflows autônomos. O anúncio também declarou que a Moveworks continuava disponível como solução independente dentro do portfólio. Isso estabelece a oferta descrita naquela data, sem assegurar condições comerciais atuais de cada pacote. [ServiceNow — EmployeeWorks e Autonomous Workforce](https://investor.servicenow.com/news/news-details/2026/ServiceNow-launches-Autonomous-Workforce-that-thinks-and-acts-adds-Moveworks-to-the-ServiceNow-AI-Platform/default.aspx).

No Knowledge 2026, a empresa apresentou ServiceNow Otto como experiência que combina Now Assist, Moveworks e AI Experience. O texto distingue os primeiros pontos de acesso da implantação futura em outros produtos; não permite presumir disponibilidade uniforme de todas as combinações anunciadas. [Moveworks/ServiceNow — anúncio Otto](https://www.moveworks.com/us/en/company/news/press-releases/servicenow-otto-creates-the-unified-ai-experience-for-the-enterp).

## Mercado, uso e compradores

A homepage apresenta uma plataforma de assistente empresarial para buscar informações e executar ações em aplicações de negócio, com exemplos em IT, RH, finanças e outras áreas. [Moveworks — homepage](https://www.moveworks.com/).

Na oferta de RH, os casos anunciados incluem localizar políticas e saldos de férias, atualizar endereço e nome, gerar declaração de vínculo, apoiar onboarding, registrar e acompanhar casos de RH, solicitar férias e enviar lembretes de treinamento. A plataforma anuncia suporte em chat, navegador, intranet e portal, com respostas apoiadas em fontes. [Moveworks — solução para RH](https://www.moveworks.com/us/en/solutions/ai-for-hr).

**Análise:** seus interlocutores comerciais podem incluir TI, plataformas empresariais, serviços compartilhados e operações de RH, dependendo do projeto. O usuário que solicita ajuda pode ser qualquer empregado; o administrador desenha integrações, permissões e automações. Isso difere do gerente de DP ou jurídico usando nosso painel para analisar um lote de vínculos e decidir o encaminhamento de exceções, embora as áreas e orçamentos possam se sobrepor.

## Engenharia e funcionalidades relevantes

| Camada de produto | Entrega anunciada |
| --- | --- |
| AI Assistant | Interface de linguagem natural para buscar e executar tarefas entre aplicações. |
| Enterprise Search | Busca contextual, com fontes e respeito às permissões do usuário. |
| Tool Studio | Construção, teste e implantação de ferramentas e automações para agentes. |
| Service Management | Atendimento, encaminhamento e acompanhamento de solicitações. |
| [Employee Experience Insights](https://www.moveworks.com/us/en/platform/employee-experience-insights) | Análise de tickets, agrupamento de temas, identificação de problemas recorrentes e acompanhamento de volume e tempo de resolução. |

Inventário de produtos e capacidades públicas; disponibilidade e composição contratual precisam ser confirmadas. [Moveworks — plataforma](https://www.moveworks.com/), [RH e fontes](https://www.moveworks.com/us/en/solutions/ai-for-hr), [desenvolvimento](https://www.moveworks.com/us/en/developers).

| Elemento documentado | Papel descrito | Aplicação possível ao HR Compliance AI — análise |
| --- | --- | --- |
| Manifest Generator | Selecionar ferramentas relevantes para uma solicitação. | Restringir ferramentas à obrigação e ao contexto do caso. |
| Slot Resolver | Resolver entidades mencionadas para identificadores dos sistemas. | Identificar vínculo, empregador e competência antes de consultar dados. |
| Action Orchestrator | Coordenar execução, tentativas, alternativas e progresso. | Conduzir consultas e registrar impedimentos da investigação. |
| Policy Validator | Aplicar verificações determinísticas antes da ação. | Exigir regras e aprovações verificáveis para ações autorizadas. |

Esses componentes são apresentados em documentação pública da plataforma; não representam inspeção de sua implementação interna. [Moveworks — Developers](https://www.moveworks.com/us/en/developers).

A documentação de escolha de ferramentas distingue busca indexada e busca ao vivo, ferramentas MCP, plugins e comunicação com outros agentes. A escolha depende de latência, acesso, reversibilidade e controle da execução. Não é preciso presumir que toda consulta seja RAG ou toda ação seja uma chamada de LLM. [Moveworks — Choosing the right tool framework](https://docs.moveworks.com/tool-studio/cookbooks/choosing-the-right-tool-framework).

O guia, atualizado em 23/10/2026, limita o A2A nativo à disponibilidade controlada e ao novo Agentic Orchestrator, com atualização citada para o primeiro trimestre de 2027. Anúncios e materiais de produto podem ter ritmos de atualização diferentes. Validar disponibilidade por tenant, região, versão e contrato antes de comparar funcionalidades. [Mesmo guia técnico](https://docs.moveworks.com/tool-studio/cookbooks/choosing-the-right-tool-framework).

A documentação também prevê execução proativa: gatilhos por webhook e agendamento, acompanhamento em logs e aprovações quando configuradas. Portanto, a plataforma não se limita a responder a uma conversa iniciada pelo empregado. [Moveworks — System triggers](https://docs.moveworks.com/tool-studio/system-triggers).

Plugins são documentados como ferramentas determinísticas com estado para executar operações controladas. **Análise:** isso aproxima o desenho de uma separação entre decisão agêntica e execução governada; ainda não comprova que determinado workflow trabalhista esteja pronto ou juridicamente validado. [Moveworks — Why plugins](https://docs.moveworks.com/tool-studio/why-plugins).

**Análise:** a proximidade com nossa proposta está na combinação de linguagem natural, ferramentas, identificação de entidades, planejamento, execução e controles. A diferença que precisamos provar está no domínio executável e na qualidade da investigação. Um Policy Validator de ações não deve ser automaticamente equiparado ao nosso motor de regras trabalhistas temporais, nem busca documental a um dossiê com evidências suficientes.

## Implantação e preço observáveis

A oferta de Professional Services inclui consultores e engenheiros de implantação, configuração de integrações, desenvolvimento específico, mudança organizacional e acompanhamento. A documentação descreve trabalhos por Statement of Work e suporte de Forward Deployed Engineers. Isso indica opções reais de trabalho de integração e implantação, sem estabelecer que todos os clientes contratem o mesmo pacote. [Moveworks — Professional Services](https://www.moveworks.com/us/en/professional-services), [escopo documentado](https://docs.moveworks.com/ai-assistant/getting-started/professional-services/moveworks-professional-services-scope).

A listagem de software publicada pela Moveworks na AWS Marketplace apresenta **US$ 150 por usuário por ano**, contrato de 12 meses, na faixa de 1.000 a 2.500 usuários. É uma referência daquela oferta, não preço universal, mínimo para toda empresa ou cotação de um pacote ServiceNow. Não permite calcular o custo total de implantação, customização ou suporte de outro projeto. [AWS Marketplace — oferta Moveworks](https://aws.amazon.com/marketplace/pp/prodview-ug6tevy5i3tiu).

**Análise:** essa faixa também intercepta parte do ICP de 100 a 3.000 empregados proposto no nosso documento. Assim, não é correto excluir competição apenas pelo porte do cliente. A decisão pode ser entre adquirir nosso produto especializado e configurar a plataforma empresarial já contratada.

## Resultados públicos e limites

O caso Consumers Energy atribui a uma campanha sobre licenças Adobe a recuperação de 1.000 licenças e US$ 55 mil de economia em 14 dias. Também informa resolução de 35% das solicitações de suporte em minutos. São resultados publicados pelo fornecedor, vinculados a uma operação específica. A página contém redações diferentes sobre as 16 mil horas de produtividade — por mês em um trecho e em 12 meses em outro —, portanto essa medida não foi usada como referência nesta análise. [Moveworks — Consumers Energy](https://www.moveworks.com/us/en/customers/consumers-energy-saves-money-with-moveworks-internal-communication-software).

Outro cuidado: a página de RH apresenta redução de custo Tier 1 de IT e RH da ManTech como **projeção para 2027**; não deve ser relatada como ganho já realizado. Métricas de satisfação, tickets ou tempo de atendimento também não comprovam precisão de investigação jurídica. [Moveworks — RH](https://www.moveworks.com/us/en/solutions/ai-for-hr).

## Competição e resposta recomendada

**Análise:**

- **Concorrência adjacente:** assistência interna e automação de RH atendem tarefas e compradores parcialmente comuns.
- **Substituição por plataforma:** cliente ou integrador pode construir uma investigação na infraestrutura já adquirida. A viabilidade e o custo precisam ser comparados no mesmo caso.
- **Distribuição e portfólio:** a associação com ServiceNow pode facilitar acesso a clientes e integração comercial. Isso é risco estratégico plausível, não prova de venda conjunta obrigatória ou de desconto específico.
- **Possível complementaridade:** nosso serviço especializado poderia fornecer verificações e evidências a uma interface empresarial. É uma opção arquitetural/comercial a avaliar, não uma parceria existente.

Para o MVP, manteríamos o Compliance Case e o fluxo de auditoria como centro: importar dados, determinar cobertura, avaliar regra, investigar hipóteses, obter evidência ausente, revisar e revalidar. Chat pode ser uma entrada adicional. Na interface, tornar visíveis fontes, responsáveis, tentativas, falhas e aprovações; não exigir que o gerente conheça nomes de ferramentas.

Uma demonstração comparativa útil usaria o mesmo conjunto de ponto, folha e banco de horas: uma divergência real, uma compensação válida e um caso inconclusivo. Medir tempo humano, resultado correto, proveniência, persistência do estado e esforço de implantação. Não basta comparar quantidade de integrações, agentes ou telas.
