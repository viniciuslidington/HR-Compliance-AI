import { describe, expect, it } from "vitest";
import { dias_entre, formatar_data, rotulo_relativo, somar_horas } from "./datas";

describe("dias_entre", () => {
  it("conta dias de calendário", () => {
    expect(dias_entre("2026-11-07", "2026-11-10")).toBe(3);
    expect(dias_entre("2026-11-10", "2026-11-07")).toBe(-3);
    expect(dias_entre("2026-11-07", "2026-11-07")).toBe(0);
  });
  it("não é afetado por mudança de horário (virada de mês e de ano)", () => {
    expect(dias_entre("2026-10-31", "2026-11-01")).toBe(1);
    expect(dias_entre("2026-12-31", "2027-01-01")).toBe(1);
    expect(dias_entre("2026-02-27", "2026-03-01")).toBe(2);
  });
});

describe("somar_horas", () => {
  it("soma horas a um ISO e devolve ISO", () => {
    expect(somar_horas("2026-11-07T10:00:00.000Z", 24)).toBe("2026-11-08T10:00:00.000Z");
    expect(somar_horas("2026-11-07T23:00:00.000Z", 2)).toBe("2026-11-08T01:00:00.000Z");
    expect(somar_horas("2026-11-07T10:00:00.000Z", -10)).toBe("2026-11-07T00:00:00.000Z");
  });
});

describe("formatar_data", () => {
  it("formata dd/mm/aaaa a partir de data ou ISO completo", () => {
    expect(formatar_data("2026-11-07")).toBe("07/11/2026");
    expect(formatar_data("2026-03-05T12:30:00.000Z")).toBe("05/03/2026");
  });
});

describe("rotulo_relativo", () => {
  const agora = new Date(2026, 10, 7, 14, 0, 0); // 07/11/2026 14:00 local
  it("usa hoje, em n dias, há n dias", () => {
    expect(rotulo_relativo("2026-11-07", agora)).toBe("hoje");
    expect(rotulo_relativo("2026-11-08", agora)).toBe("em 1 dia");
    expect(rotulo_relativo("2026-11-10", agora)).toBe("em 3 dias");
    expect(rotulo_relativo("2026-11-06", agora)).toBe("há 1 dia");
    expect(rotulo_relativo("2026-11-02", agora)).toBe("há 5 dias");
  });
  it("virada de meia-noite: menos de 24h de diferença, mas dia diferente", () => {
    const quase_meia_noite = new Date(2026, 10, 7, 23, 59, 0);
    expect(rotulo_relativo("2026-11-08", quase_meia_noite)).toBe("em 1 dia");
    const logo_apos = new Date(2026, 10, 8, 0, 1, 0);
    expect(rotulo_relativo("2026-11-08", logo_apos)).toBe("hoje");
    expect(rotulo_relativo("2026-11-07", logo_apos)).toBe("há 1 dia");
  });
  it("robusto a mudança de horário de verão (datas de calendário)", () => {
    // 2018-11-04: início do horário de verão no Brasil (dia com 23h); contagem segue por calendário
    const antes = new Date(2018, 10, 3, 22, 0, 0);
    expect(rotulo_relativo("2018-11-05", antes)).toBe("em 2 dias");
    expect(rotulo_relativo("2018-11-04", antes)).toBe("em 1 dia");
  });
});
