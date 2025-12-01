import ChatBot from 'react-chatbotify'

const MyChatbot = () => {
	const helpOptions = ["What's the web app about?", "Why do I have to register to use it?", "Are these conversations recorded?"];
	
	const flow = {
		start: {
			message: "Hello, welcome to use this web app 😊!",
			transition: {duration: 1000},
			path: "show_options"
		},
		show_options: {
			message: "Here are some topics you might be interested in:",
			options: helpOptions,
			path: "process_options"
		},
		prompt_again: {
			message: "Do you need any other help?",
			options: helpOptions,
			path: "process_options"
		},
		unknown_input: {
			message: "Sorry, I do not understand your message 😢!",
			options: helpOptions,
			path: "process_options"
		},
		process_options: {
			transition: {duration: 1000},
			chatDisabled: true,
			path: async (params) => {
				let reply = "";
				switch (params.userInput) {
					case "What's the web app about?":
						reply = "The web app is just a full-stack demo.";
						break;
					case "Why do I have to register to use it?":
						reply = "It's part of the demo.";
						break;
					case "Are these conversations recorded?":
						reply = "No, you having conversation with your browser."
						break;
					default:
						return "unknown_input";
				}
				await params.injectMessage(reply);
				
				return "repeat"
			},
		},
		repeat: {
			transition: {duration: 2000},
			path: "prompt_again"
		},
	}

	const settings = {
    isOpen: false,
    general: {
      primaryColor: '#42b0c5',
      secondaryColor: '#491d8d',
      fontFamily: 'Arial, sans-serif',
      embedded: false
    },
	header: {
		title: "Assistant"
	},
    audio: {
      disabled: true,
    },
	tooltip: {
		text: "Ask about this web app! 😊"
	}
  };
	
	return (
		<ChatBot settings={settings} flow={flow} />
	);
};

export default MyChatbot