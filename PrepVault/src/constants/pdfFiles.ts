
export const PDF_FILES = {
  '2022': [
    {
      name: 'testing-v01.pdf',
      source: require('../../assets/pdfs/2022/testing-v01.pdf'),
    },
    {
      name: 'testing-v02.pdf',
      source: require('../../assets/pdfs/2022/testing-v02.pdf'),
    },
  ],

  '2023': [
    {
      name: 'testing-v01.pdf',
      source: require('../../assets/pdfs/2023/testing-v01.pdf'),
    },
    {
      name: 'testing-v02.pdf',
      source: require('../../assets/pdfs/2023/testing-v02.pdf'),
    },
  ],

  '2024': [
    {
      name: 'testing-v01.pdf',
      source: require('../../assets/pdfs/2024/testing-v01.pdf'),
    },
    {
      name: 'testing-v02.pdf',
      source: require('../../assets/pdfs/2024/testing-v02.pdf'),
    },
  ],

  '2025': [
    {
      name: 'testing-v01.pdf',
      source: require('../../assets/pdfs/2025/testing-v01.pdf'),
    },
    {
      name: 'testing-v02.pdf',
      source: require('../../assets/pdfs/2025/testing-v02.pdf'),
    },
  ],

  '2026': [
    {
      name: 'testing-v01.pdf',
      source: require('../../assets/pdfs/2026/testing-v01.pdf'),
    },
    {
      name: 'testing-v02.pdf',
      source: require('../../assets/pdfs/2026/testing-v02.pdf'),
    },
  ],

  maths: [
    {
      name: 'testing-v01.pdf',
      source: require('../../assets/pdfs/maths/testing-v01.pdf'),
    },
    {
      name: 'testing-v02.pdf',
      source: require('../../assets/pdfs/maths/testing-v02.pdf'),
    },
  ],

  computer: [
    {
      name: 'testing-v01.pdf',
      source: require('../../assets/pdfs/computer/testing-v01.pdf'),
    },
    {
      name: 'testing-v02.pdf',
      source: require('../../assets/pdfs/computer/testing-v02.pdf'),
    },
  ],

  reasoning: [
    {
      name: 'testing-v01.pdf',
      source: require('../../assets/pdfs/reasoning/testing-v01.pdf'),
    },
    {
      name: 'testing-v02.pdf',
      source: require('../../assets/pdfs/reasoning/testing-v02.pdf'),
    },
  ],
};

export type PdfFolder = keyof typeof PDF_FILES;
