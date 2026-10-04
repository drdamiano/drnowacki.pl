// Netlify uruchamia tę funkcję po każdym zweryfikowanym (nie-spamowym)
// zgłoszeniu formularza — nazwa pliku = nazwa zdarzenia „submission-created”.
// Dopisuje zgłoszenie do bazy Notion „LEADY IG”.
//
// Zmienne środowiskowe (Netlify → Site configuration → Environment variables):
//   NOTION_TOKEN           — wymagana; bez niej funkcja nic nie robi i kończy się bez błędu
//   NOTION_DATA_SOURCE_ID  — opcjonalna; domyślnie notion.dataSourceId z site.config.mjs

import { Client } from '@notionhq/client';
import config from '../../site.config.mjs';
import { leadFromSubmission, buildProperties } from '../../lib/notion-lead.mjs';

export default async (req) => {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.log('[notion] Brak NOTION_TOKEN — zapis do Notion wyłączony.');
    return new Response('skipped');
  }

  let payload;
  try {
    ({ payload } = await req.json());
  } catch {
    console.error('[notion] Nieprawidłowe dane zdarzenia.');
    return new Response('bad request', { status: 400 });
  }

  if (payload?.form_name && payload.form_name !== config.form.name) {
    return new Response('ignored');
  }

  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID || config.notion.dataSourceId;
  const notion = new Client({ auth: token, notionVersion: '2025-09-03' });

  try {
    // Schemat pobierany przy każdym uruchomieniu: nowe kolumny (np. „Źródło”)
    // zaczynają się wypełniać bez zmian w kodzie.
    const dataSource = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
    const lead = leadFromSubmission(payload, config);
    const properties = buildProperties(dataSource.properties, lead, config);

    await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: dataSourceId },
      properties,
    });

    // Bez danych osobowych w logach.
    console.log(`[notion] Zapisano zgłoszenie ${payload?.id ?? ''} (pola: ${Object.keys(properties).join(', ')})`);
    return new Response('ok');
  } catch (err) {
    console.error(`[notion] Błąd zapisu zgłoszenia ${payload?.id ?? ''}: ${err.code ?? ''} ${err.message}`);
    return new Response('notion error', { status: 500 });
  }
};
