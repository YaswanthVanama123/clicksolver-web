import i18n, { LANGUAGE_KEY } from './i18n';

export async function changeAppLanguage(languageCode) {
  try {
    await i18n.changeLanguage(languageCode);
    localStorage.setItem(LANGUAGE_KEY, languageCode);
    console.log('Language changed to:', languageCode);
  } catch (error) {
    console.error('Error changing language:', error);
  }
}
