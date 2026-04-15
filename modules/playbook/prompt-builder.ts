import type { BrandPlaybook } from "./types";

export function buildSystemPrompt(playbook: BrandPlaybook | null): string {
  if (!playbook) {
    return [
      "Você é um assistente de social media.",
      "Crie conteúdo engajante, profissional e adequado para redes sociais.",
      "Use linguagem clara e acessível.",
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
      `## Palavras Obrigatórias\nSempre use: ${playbook.mandatory_words.join(", ")}\n`
    );
  }

  if (playbook.forbidden_words.length > 0) {
    sections.push(
      `## Palavras Proibidas\nNunca use: ${playbook.forbidden_words.join(", ")}\n`
    );
  }

  if (playbook.default_cta) {
    sections.push(`## CTA Padrão\n${playbook.default_cta}\n`);
  }

  if (playbook.do_examples) {
    sections.push(`## O que FAZER\n${playbook.do_examples}\n`);
  }

  if (playbook.dont_examples) {
    sections.push(`## O que NÃO FAZER\n${playbook.dont_examples}\n`);
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
      `## Instruções Adicionais\n${playbook.extra_instructions}\n`
    );
  }

  return sections.join("\n");
}
