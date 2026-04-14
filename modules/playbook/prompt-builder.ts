import type { BrandPlaybook } from "./types";

export function buildSystemPrompt(playbook: BrandPlaybook | null): string {
  if (!playbook) {
    return [
      "Voce e um assistente de social media.",
      "Crie conteudo engajante, profissional e adequado para redes sociais.",
      "Use linguagem clara e acessivel.",
    ].join("\n");
  }

  const sections: string[] = [];

  sections.push("# Brand Playbook\n");

  if (playbook.tone_of_voice) {
    sections.push(`## Tom de Voz\n${playbook.tone_of_voice}\n`);
  }

  if (playbook.style) {
    sections.push(`## Estilo\n${playbook.style}\n`);
  }

  if (playbook.mandatory_words.length > 0) {
    sections.push(
      `## Palavras Obrigatorias\nSempre use: ${playbook.mandatory_words.join(", ")}\n`
    );
  }

  if (playbook.forbidden_words.length > 0) {
    sections.push(
      `## Palavras Proibidas\nNunca use: ${playbook.forbidden_words.join(", ")}\n`
    );
  }

  if (playbook.default_cta) {
    sections.push(`## CTA Padrao\n${playbook.default_cta}\n`);
  }

  if (playbook.do_examples) {
    sections.push(`## O que FAZER\n${playbook.do_examples}\n`);
  }

  if (playbook.dont_examples) {
    sections.push(`## O que NAO FAZER\n${playbook.dont_examples}\n`);
  }

  if (playbook.post_examples.length > 0) {
    sections.push("## Exemplos de Posts (Few-Shot)\n");
    for (const ex of playbook.post_examples) {
      const lines = [
        `- **Pilar:** ${ex.pilar}`,
        `  **Formato:** ${ex.format}`,
        `  **Caption:** ${ex.caption}`,
        `  **Hashtags:** ${ex.hashtags}`,
      ];
      if (ex.engagement_rate !== undefined) {
        lines.push(`  **Engagement Rate:** ${ex.engagement_rate}%`);
      }
      if (ex.notes) {
        lines.push(`  **Notas:** ${ex.notes}`);
      }
      sections.push(lines.join("\n") + "\n");
    }
  }

  if (playbook.extra_instructions) {
    sections.push(
      `## Instrucoes Adicionais\n${playbook.extra_instructions}\n`
    );
  }

  return sections.join("\n");
}
