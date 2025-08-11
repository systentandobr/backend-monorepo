export const handlerImportFileErrorMessage = async (error: Error) => {
  console.error('Error importing questions:', error);
  switch (error.name) {
    case 'ValidationError':
      return 'Alguma pergunta sem resposta correta não é permitido';
    case 'Invalid file extension':
      return 'Por favor import um formato de arquivo válido';
    case 'File not found':
      return 'Arquivo não encontrado';
    default:
      return 'Error importing questions';
  }
};
