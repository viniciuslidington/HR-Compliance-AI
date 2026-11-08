"use client";

import { useState, type FormEvent } from "react";
import { useAcao, useConsulta } from "../api/contexto";
import { data_local } from "../domain/datas";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";
import { Field } from "../ui/Field";
import { Select } from "../ui/Select";
import esqueleto from "./Esqueleto.module.css";
import estilos from "./NovaAdmissao.module.css";

export interface NovaAdmissaoProps {
  ao_criar: (id: string) => void;
  ao_cancelar: () => void;
}

type Erros = Partial<Record<"nome" | "whatsapp" | "cargo" | "data_inicio" | "documentos", string>>;

/** O número já traz o país: com "+", ou 12–13 dígitos começando por 55 (DDD 55 tem só 10–11 no total). */
function tem_pais(bruto: string, digitos: string): boolean {
  return bruto.trim().startsWith("+") || (digitos.length >= 12 && digitos.startsWith("55"));
}

/** Máscara leve: "(11) 98765-4321", ou "+55 (11) 98765-4321" quando o número traz o país. Nunca corta dígitos válidos. */
export function mascarar_whatsapp(bruto: string): string {
  const digitos = bruto.replace(/\D/g, "").slice(0, 13);
  const com_pais = tem_pais(bruto, digitos);
  const pais = com_pais ? digitos.slice(0, 2) : "";
  const resto = com_pais ? digitos.slice(2) : digitos;
  const ddd = resto.slice(0, 2);
  const local = resto.slice(2);
  let saida = com_pais ? `+${pais}` : "";
  if (ddd) saida += `${saida ? " " : ""}(${ddd}${ddd.length === 2 && local ? ")" : ""}`;
  if (local) saida += ` ${local.length > 5 ? `${local.slice(0, 5)}-${local.slice(5)}` : local}`;
  return saida;
}

/** Devolve o número no formato "+5511987654321", ou null se não for válido. */
export function whatsapp_para_guardar(valor: string): string | null {
  const digitos = valor.replace(/\D/g, "");
  const n = digitos.length;
  if (valor.trim().startsWith("+")) return n >= 12 && n <= 13 ? `+${digitos}` : null;
  if (n >= 10 && n <= 11) return `+55${digitos}`;
  if (n >= 12 && n <= 13 && digitos.startsWith("55")) return `+${digitos}`;
  return null;
}

export function NovaAdmissao({ ao_criar, ao_cancelar }: NovaAdmissaoProps) {
  const executar = useAcao();
  const dados = useConsulta((api) => ({
    modelos: api.listar_modelos(),
    catalogo: api.listar_catalogo(),
    hoje: data_local(api.agora()),
  }));

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cargo, setCargo] = useState("");
  const [data_inicio, setDataInicio] = useState("");
  // null = ainda não escolhido: vale o primeiro modelo e o checklist dele.
  const [modelo_escolhido, setModelo] = useState<string | null>(null);
  const [lista, setLista] = useState<string[] | null>(null);
  const [erros, setErros] = useState<Erros>({});
  const [criando, setCriando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  if (!dados) {
    return (
      <div aria-busy="true">
        <Eyebrow>Painel do RH</Eyebrow>
        <h1 className={`text-display-h2 ${estilos.titulo}`}>Nova admissão</h1>
        <div className={`${esqueleto.bloco} ${estilos.esqueleto}`} />
      </div>
    );
  }

  const { modelos, catalogo, hoje } = dados;
  const modelo_id = modelo_escolhido ?? modelos[0]?.modelo.id ?? "";
  const documentos = lista ?? (modelos.find((m) => m.modelo.id === modelo_id)?.tipos.map((t) => t.id) ?? []);
  const nome_do = (id: string) => catalogo.find((t) => t.id === id)?.nome ?? id;
  const disponiveis = catalogo.filter((t) => !documentos.includes(t.id));

  function escolher_modelo(id: string) {
    setModelo(id);
    setLista(null);
    setErros((e) => ({ ...e, documentos: undefined }));
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (criando) return;
    const novos: Erros = {};
    if (!nome.trim()) novos.nome = "Informe o nome do colaborador.";
    const whatsapp_final = whatsapp_para_guardar(whatsapp);
    if (!whatsapp_final) novos.whatsapp = "Informe um WhatsApp com DDD, por exemplo (11) 98765-4321.";
    if (!cargo.trim()) novos.cargo = "Informe o cargo.";
    if (!data_inicio) novos.data_inicio = "Escolha a data de início.";
    else if (data_inicio < hoje) novos.data_inicio = "A data de início não pode ser anterior a hoje.";
    if (documentos.length === 0) novos.documentos = "Escolha ao menos um documento para o agente pedir.";
    setErros(novos);
    if (Object.keys(novos).length > 0) return;
    setCriando(true);
    setFalhou(false);

    let criada: { id: string };
    try {
      criada = executar((api) =>
        api.criar_admissao({
          nome: nome.trim(),
          whatsapp: whatsapp_final!,
          cargo: cargo.trim(),
          data_inicio,
          modelo_id,
          documentos: documentos.map((tipo_documento_id) => ({ tipo_documento_id })),
        }),
      );
    } catch {
      // Só na falha: no sucesso a página navega, e `criando` segue barrando um segundo envio.
      setCriando(false);
      setFalhou(true);
      return;
    }
    ao_criar(criada.id);
  }

  return (
    <div>
      <header className={estilos.cabecalho}>
        <Eyebrow>Painel do RH</Eyebrow>
        <h1 className={`text-display-h2 ${estilos.titulo}`}>Nova admissão</h1>
      </header>

      <div className={estilos.grade}>
        <form className={estilos.form} onSubmit={enviar} noValidate>
          <div className={estilos.campos}>
            <Field rotulo="Nome" erro={erros.nome}>
              <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" />
            </Field>
            <Field rotulo="WhatsApp" erro={erros.whatsapp} ajuda="O agente escreve neste número.">
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(mascarar_whatsapp(e.target.value))}
                inputMode="tel"
                placeholder="(11) 98765-4321"
                autoComplete="off"
              />
            </Field>
            <Field rotulo="Cargo" erro={erros.cargo}>
              <input value={cargo} onChange={(e) => setCargo(e.target.value)} autoComplete="off" />
            </Field>
            <Field rotulo="Data de início" erro={erros.data_inicio}>
              <input type="date" value={data_inicio} min={hoje} onChange={(e) => setDataInicio(e.target.value)} />
            </Field>
            <Field rotulo="Modelo" ajuda="Define os documentos que o agente pede.">
              <Select value={modelo_id} onChange={(e) => escolher_modelo(e.target.value)}>
                {modelos.map((m) => (
                  <option key={m.modelo.id} value={m.modelo.id}>
                    {m.modelo.nome}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <fieldset className={estilos.documentos}>
            <legend className={`text-label ${estilos.legenda}`}>Documentos</legend>
            {documentos.length > 0 ? (
              <ul className={estilos.itens}>
                {documentos.map((id) => (
                  <li key={id} className={`text-body-sm ${estilos.item}`}>
                    <span>{nome_do(id)}</span>
                    <Button
                      variante="discreto"
                      tamanho="sm"
                      aria-label={`Remover ${nome_do(id)}`}
                      onClick={() => setLista(documentos.filter((d) => d !== id))}
                    >
                      Remover
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
            {erros.documentos && (
              <p role="alert" className={`text-body-sm ${estilos.erro}`}>
                {erros.documentos}
              </p>
            )}
            {disponiveis.length > 0 && (
              <div className={estilos.adicionar}>
                <span className={`text-body-sm ${estilos.dica}`}>Adicionar do catálogo</span>
                <div className={estilos.chips}>
                  {disponiveis.map((t) => (
                    <Button
                      key={t.id}
                      variante="secundario"
                      tamanho="sm"
                      onClick={() => {
                        setLista([...documentos, t.id]);
                        setErros((e) => ({ ...e, documentos: undefined }));
                      }}
                    >
                      + {t.nome}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </fieldset>

          {falhou && (
            <p role="alert" className={`text-body-sm ${estilos.erro}`}>
              Não consegui criar a admissão. Tente de novo.
            </p>
          )}
          <div className={estilos.rodape}>
            <Button type="submit" disabled={criando}>
              Criar admissão
            </Button>
            <Button variante="secundario" onClick={ao_cancelar}>
              Cancelar
            </Button>
          </div>
        </form>

        <aside className={estilos.previa} aria-label="Prévia do pedido">
          <p className={`text-label ${estilos.previa_titulo}`}>O agente vai pedir:</p>
          {documentos.length === 0 ? (
            <p className={`text-body-sm ${estilos.dica}`}>Nenhum documento escolhido.</p>
          ) : (
            <ul className={estilos.previa_lista}>
              {documentos.map((id) => (
                <li key={id}>
                  <span className="text-body-sm">{nome_do(id)}</span>
                  <span className={`text-body-sm ${estilos.dica}`}>
                    {catalogo.find((t) => t.id === id)?.instrucao_colaborador}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
