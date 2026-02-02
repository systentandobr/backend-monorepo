import { BadRequestException } from '@nestjs/common';

export class CheckInLocationError extends BadRequestException {
  constructor() {
    super({
      statusCode: 400,
      message: 'Um check-in só pode ser feito dentro da academia',
      error: 'LOCATION_OUT_OF_RANGE',
    });
  }
}

export class CheckInTrainingInProgressError extends BadRequestException {
  constructor() {
    super({
      statusCode: 400,
      message: 'Ao fazer o check-in precisa executar e encerrar o treino',
      error: 'TRAINING_IN_PROGRESS',
    });
  }
}

export class CheckInAlreadyDoneError extends BadRequestException {
  constructor() {
    super({
      statusCode: 400,
      message: 'Check-in já realizado hoje',
      error: 'CHECK_IN_ALREADY_DONE',
    });
  }
}
