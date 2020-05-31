var eyePopping = function () {
    /*name: 'EyePopping',*/
    var self = this;

    self.init = function () {
        const stringToColor = (str) => {
            const djambiColors = [
                "#c8f7c5", "#7fffd4", "#baf73c", "#98fb98", "#00ff7f", "#90ee90", "#00ff00", "#00fa9a", "#38f689", "#a2ded0",
                "#3cf73c", "#abe338", "#86e2d5", "#4ae08c", "#4add8c", "#87d37c", "#6ad4b1", "#9acd32", "#36d7b7", "#7ed07e",
                "#90c695", "#4ecdc4", "#66cc99", "#65c6bb", "#00d46a", "#2eccb0", "#00d400", "#00cf80", "#2ecc91", "#68c3a3",
                "#76c376", "#2ecc71", "#03c9a9", "#32cd32", "#2ecc51", "#2ecc32", "#3fc380", "#8bb82d", "#26c281", "#1bbc9b",
                "#2abb9b", "#3cb572", "#3cb371", "#4daf7c", "#55aa8d", "#00b16a", "#65a665", "#7aa228", "#e0ffff", "#e4f1fe",
                "#c5eff7", "#00ffff", "#00f8fb", "#add8e6", "#bbd4d4", "#00e0e0", "#34dbdb", "#81cfe0", "#89c4f4", "#00d4d4",
                "#00ced1", "#6bb9f0", "#00bfff", "#8db0bb", "#34b9db", "#95aaaa", "#19b5fe", "#52b3d9", "#59abe3", "#00b5b5",
                "#22a7f0", "#00aaaa", "#6495ed", "#ffecdb", "#dcc6e0", "#f1a9a0", "#dda0dd", "#aea8d3", "#be90d4", "#e08283",
                "#fc6399", "#ffffff", "#fefefe", "#f2f1ef", "#ecf0f1", "#eeeeee", "#ececec", "#e8e8e8", "#dadfe1", "#d2d7d3",
                "#d5d5d5", "#d4d4d4", "#d3d3d3", "#b2cce5", "#bdc3c7", "#bfbfbf", "#bebebe", "#abb7b7", "#aaaaaa", "#a9a9a9",
                "#7bacdd", "#91a6ba", "#95a5a6", "#fffacd", "#f1f227", "#c9f227", "#ffd700", "#f5d76e", "#f4d03f", "#f7ca18",
                "#d4d0ab", "#f2ca27", "#d4b300", "#f2a127", "#e2a50e", "#daa520", "#c7a720", "#aaa789", "#f27927", "#fde3a7",
                "#e6cc22", "#f9bf3b", "#f4b350", "#f5ab35", "#ffa07a", "#f4a460", "#e6a522", "#f39c12", "#f89406", "#eb974e",
                "#ff8c00", "#eb9532", "#ff7f50", "#f2784b", "#f27935", "#e87e04", "#e67e22", "#d48566", "#c9874f", "#f9690e",
                "#e7903c", "#ff6347"
            ];

            let sum = 0;
            const salt = 10; // Improve spread
            for (let i = 0; i < str.length; i++) {
                sum += str.charCodeAt(i) * salt;
            }
            return djambiColors[sum % (djambiColors.length - 1)];
        };

        const replaceTextWithStyledElement = (parentNode) => {
            const createStyledElement = (name) => {
                const color = stringToColor(name);
                const textElement = document.createElement("span");
                textElement.style.backgroundColor = color;
                textElement.style.color = "black";
                textElement.style.fontWeight = "bold";
                textElement.style.whiteSpace = "nowrap";
                textElement.style.display = "inline-block";
                textElement.style.paddingLeft = "5px";
                textElement.textContent = name;

                const arrowElement = document.createElement("span");
                arrowElement.style.width = "0px";
                arrowElement.style.borderWidth = "0px";
                arrowElement.style.borderLeft = "10px solid " + color;
                arrowElement.style.borderTop = "7px solid transparent";
                arrowElement.style.borderBottom = "7px solid transparent";
                arrowElement.style.display = "inline-block";
                arrowElement.style.paddingRight = "5px";

                const wrapperElement = document.createElement("div");
                wrapperElement.style.display = "inline-flex";
                wrapperElement.appendChild(textElement);
                wrapperElement.appendChild(arrowElement);

                return wrapperElement;
            };

            if (parentNode.nodeName === "PRE" && parentNode.childNodes.length === 2 && parentNode.childNodes[0].nodeName === "#text") {
                const nameNode = parentNode.childNodes[0];
                const name = nameNode.data; // Content looks like name> 
                const position = name.lastIndexOf(">");
                const truncatedName = name.substring(0, position);

                const messageNode = parentNode.childNodes[1];
                parentNode.removeChild(messageNode);

                const wrapperNode = createStyledElement(truncatedName);
                wrapperNode.appendChild(messageNode);
                nameNode.replaceWith(wrapperNode);
            }
        };

        self.chatObserver = new MutationObserver(function (mutations) {
            mutations.forEach(({ addedNodes }) => {
                if (addedNodes !== null) {
                    addedNodes.forEach(node => replaceTextWithStyledElement(node));
                }
            });
        });

        const chat = document.getElementById("chat");

        // Listen to chat dom mutation
        self.chatObserver.observe(chat, {
            childList: true
        });

        // Also change chat history
        chat.childNodes.forEach(node => replaceTextWithStyledElement(node));
    };

    self.stop = function () {
        // Stop listening to chat dom mutation
        self.chatObserver.disconnect();

        // Revert chart to default style
        const chat = document.getElementById("chat");
        chat.childNodes.forEach(node => {
            if (node.nodeName === "PRE" && node.childNodes.length === 1 && node.childNodes[0].nodeName === "DIV") {
                const wrapperNode = node.childNodes[0];

                const nameNode = wrapperNode.childNodes[0];
                const name = nameNode.textContent + "> ";
                const newNameNode = document.createTextNode(name);

                const messageNode = wrapperNode.childNodes[2];

                node.removeChild(wrapperNode);
                node.appendChild(newNameNode);
                node.appendChild(messageNode);
            }
        });
    }
};

var { init, stop } = new eyePopping();

$.plugin({
    name: 'EyePopping',
    init,
    stop
});