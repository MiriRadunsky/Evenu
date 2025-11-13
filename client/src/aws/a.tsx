import FileManager from "./FileManager";

const files = [
  { key: 'מערכות הפעלה קובץ נכון.pdf', name: 'תמונה 1', type: 'application/pdf' },
];

export default function A() {
  return <FileManager files={files} />;
}