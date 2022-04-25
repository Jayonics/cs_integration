import { Client, netcon } from "../gsIntegration";

export class ChatConfiguration {
    static HeadshotKillTalk: boolean = true;
    static StandardKillTalk: boolean = true;
    static DeathTalk: boolean = true;
    static FlashStateMessages: boolean = true;
    static BurningStateMessages: boolean = true;
    static SmokedStateMessages: boolean = true;
    static RainbowCrosshair: boolean = true;

    static netcon: Client;

    // Chat commands follow the format /command:option

    // Parses in game messages for configuration options
    static ParseChatCommand(chatCommand: string) {
        // Check for the help command first.
        if (chatCommand === '/help') {
            ChatConfiguration.ListChatCommands(chatCommand);
            return
        }

        // Check the prefix "/"
        if (chatCommand.charAt(0) === '/') {
            // Get the command
            let command = chatCommand.substring(1, chatCommand.indexOf(':'));
            // Get the option
            let option = chatCommand.substring(chatCommand.indexOf(':') + 1);

            // Wait one second to prevent spamming
            new Promise(resolve => setTimeout(resolve, 1000))

            // Process the command in the switch statement
            switch (command) {
                case 'headshotkilltalk':
                    if (option === 'on') {
                        ChatConfiguration.HeadshotKillTalk = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Headshot kill talk is now on');
                    } else if (option === 'off') {
                        ChatConfiguration.HeadshotKillTalk = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Headshot kill talk is now off');
                    }
                    break;
                case 'standardkilltalk':
                    if (option === 'on') {
                        ChatConfiguration.StandardKillTalk = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Standard kill talk is now on');
                    } else if (option === 'off') {
                        ChatConfiguration.StandardKillTalk = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Standard kill talk is now off');
                    }
                    break;
                case 'deathtalk':
                    if (option === 'on') {
                        ChatConfiguration.DeathTalk = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Death talk is now on');
                    } else if (option === 'off') {
                        ChatConfiguration.DeathTalk = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Death talk is now off');
                    }
                    break;
                case 'flashstatemessages':
                    if (option === 'on') {
                        ChatConfiguration.FlashStateMessages = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Flash state messages are now on');
                    } else if (option === 'off') {
                        ChatConfiguration.FlashStateMessages = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Flash state messages are now off');
                    }
                    break;
                case 'burningstatemessages':
                    if (option === 'on') {
                        ChatConfiguration.BurningStateMessages = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Burning state messages are now on');
                    } else if (option === 'off') {
                        ChatConfiguration.BurningStateMessages = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Burning state messages are now off');
                    }
                    break;
                case 'smokedstatemessages':
                    if (option === 'on') {
                        ChatConfiguration.SmokedStateMessages = true;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Smoked state messages are now on');
                    } else if (option === 'off') {
                        ChatConfiguration.SmokedStateMessages = false;
                        ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Smoked state messages are now off');
                    }
                    break;
                default:
                    ChatConfiguration.netcon.sendAllChatMessage(1000, false,'Invalid command');
                    ChatConfiguration.netcon.sendAllChatMessage(1000, false,'/help for a list of commands');
                    break;
            }
        }
    }

    // List all configuration commands if /help is used
    static async ListChatCommands(chatCommand: string) {
        if (chatCommand === '/help') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            ChatConfiguration.netcon.sendAllChatMessage(1000, false,'/headshotkilltalk - Toggle headshot kill talk on/off');
            await new Promise(resolve => setTimeout(resolve, 1000));
            ChatConfiguration.netcon.sendAllChatMessage(1000, false,'/standardkilltalk - Toggle standard kill talk on/off');
            await new Promise(resolve => setTimeout(resolve, 1000));
            ChatConfiguration.netcon.sendAllChatMessage(1000, false,'/deathtalk - Toggle death talk on/off');
            await new Promise(resolve => setTimeout(resolve, 1000));
            ChatConfiguration.netcon.sendAllChatMessage(1000, false,'/flashstatemessages - Toggle flash state messages on/off');
            await new Promise(resolve => setTimeout(resolve, 1000));
            ChatConfiguration.netcon.sendAllChatMessage(1000, false,'/burningstatemessages - Toggle burning state messages on/off');
            await new Promise(resolve => setTimeout(resolve, 1000));
            ChatConfiguration.netcon.sendAllChatMessage(1000, false,'/smokedstatemessages - Toggle smoked state messages on/off');
        }
    }
}