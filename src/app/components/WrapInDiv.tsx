import React from "react";

const FormattedText = ({
  inputText,
  fontSize = "16px",
  type = "chat",
  userTextColor,
  who,
  isTyping,
  isLast,
  botTextColor,
  voice,
}: {
  inputText: string;
  fontSize?: string;
  type?: "chat" | "normal";
  userTextColor?: string;
  who?: "bot" | "user";
  isTyping?: boolean;
  isLast?: boolean;
  botTextColor?: string;
  voice?: boolean;
}) => {
  const formatText = (text: string) => {
    let formattedText = text
      ?.replace(/^#\s(.+)/gm, "<h1><strong>$1</strong></h1>")
      ?.replace(/^##\s(.+)/gm, "<h2><strong>$1</strong></h2>")
      ?.replace(/^###\s(.+)/gm, "<h3><strong>$1</strong></h3>")
      ?.replace(/^####\s(.+)/gm, "<h4><strong>$1</strong></h4>")
      ?.replace(/^#####\s(.+)/gm, "<h5><strong>$1</strong></h5>")
      ?.replace(/^######\s(.+)/gm, "<h6><strong>$1</strong></h6>")
      ?.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      ?.replace(/^- /gm, "• ")
      ?.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="aTag" style="color: blue; font-weight: thin;">$1</a>',
      )
      ?.replace(/\n/g, "<br/>");

    const formattedTextStartStart = formattedText?.replace(
      /\* /g,
      (match, offset, string) => {
        const count = (string.slice(0, offset).match(/\* /g) || []).length + 1;
        return `${count}. `;
      },
    );

    return formattedTextStartStart;
  };

  return (
    <div className="flex flex-col">
      <div
        // className="text-left"
        style={{
          fontFamily: type === "chat" ? "var(--dynamic-font)" : "",
          fontSize: fontSize,
          color: userTextColor,
          textAlign: voice && voice === true ? "center" : "left",
        }}
        dangerouslySetInnerHTML={{ __html: formatText(inputText) }}
      ></div>
      {who === "bot" && isTyping && (
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: botTextColor }}
        ></span>
      )}
    </div>
  );
};

export default FormattedText;
