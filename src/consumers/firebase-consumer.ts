import { injectable } from 'smart-factory';
import { ConsumerModules } from './modules';
import { ConsumerTypes } from './types';
import { FcmSenderModules, FcmSenderTypes } from '../fcm-senders';
import { LoggerModules, LoggerTypes } from '../loggers';
import { ConfigModules, ConfigTypes } from '../configs';

type PushMessage = {
  title?: string;
  title_key?: string;
  subtitle?: string;
  subtitle_key?: string;
  topic: string;
  body: {[key: string]: any};
};

type NativeNotification = {
  title?: string;
  title_loc_key?: string;
  body?: string;
  body_loc_key?: string;
};

const tag = '[fcm-consumer]';

injectable(ConsumerModules.Consumers.TopicFirebaseConsumer,
  [ LoggerModules.Logger,
    FcmSenderModules.SendToTopic,
    ConfigModules.TopicConfig ],
  async (log: LoggerTypes.Logger,
    sendToTopic: FcmSenderTypes.SendToTopic,
    cfg: ConfigTypes.TopicConfig): Promise<ConsumerTypes.QueueConsumer> =>

    ({
      name: cfg.firebaseMessageQueue,
      consume: async (payload: PushMessage) => {
        log.debug(`${tag} message received from amqp queue:${cfg.firebaseMessageQueue}`);
        const notification: NativeNotification = {};
        const sendParam = {
          notification,
          data: payload.body
        };

        if (payload.title) notification.title = payload.title;
        if (payload.title_key) notification.title_loc_key = payload.title_key;
        if (payload.subtitle) notification.body = payload.subtitle;
        if (payload.subtitle_key) notification.body_loc_key = payload.subtitle_key;

        log.debug(`${tag} fcm-payload`);
        log.debug(sendParam);

        await sendToTopic(payload.topic, sendParam);
        log.debug(`${tag} message published to fcm, topic:${payload.topic}`);
      }
    }));


injectable(ConsumerModules.Consumers.PeerFirebaseConsumer,
  [ LoggerModules.Logger,
    ConfigModules.TopicConfig ],
  async (log: LoggerTypes.Logger,
    cfg: ConfigTypes.TopicConfig): Promise<ConsumerTypes.QueueConsumer> =>

    ({
      name: cfg.firebasePeerMessageQueue,
      consume: async (payload: any) => {
        log.debug(`${tag} message received from amqp queue:${cfg.firebasePeerMessageQueue}`);
        console.log(payload);
      }
    }));