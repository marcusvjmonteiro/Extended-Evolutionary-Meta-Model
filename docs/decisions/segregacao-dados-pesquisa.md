# Decisão: segregação entre dados operacionais e dados de pesquisa

Data: 2026-08-12

Contexto: a auditoria de conformidade (Rodada 2 e 3) identificou que o §4.10
do TCC afirma segregação entre dados operacionais (SQLite da aplicação) e
dados de pesquisa (feedback dos avaliadores — problemas de usabilidade, IVC,
SUS), sem que o artefato tivesse estrutura de dados própria para a segunda
classe.

Decisão: os instrumentos dos Apêndices C e D são aplicados EXTERNAMENTE à
plataforma (fora do escopo deste repositório). A plataforma não coleta,
processa nem armazena dados de pesquisa em nenhum momento. A segregação é,
portanto, arquitetural por não-existência de canal compartilhado, não uma
propriedade implementada em código.

Consequência: nenhuma alteração de schema ou rota é necessária. A afirmação
do §4.10 do TCC foi ajustada para refletir essa arquitetura com precisão.
