(() => {
  const email = "r.marleton@gmail.com";
  const relayKey = "inkspirationsLeadRelayUrl";
  const outboxKey = "inkspirationsLeadOutbox";
  const configuredRelay = window.INKSPIRATIONS_LEAD_RELAY_URL || localStorage.getItem(relayKey) || "";

  function clean(value){
    return String(value || "").trim();
  }

  function leadId(){
    return `ink-${Date.now()}-${Math.random().toString(16).slice(2,8)}`;
  }

  function getOutbox(){
    try{return JSON.parse(localStorage.getItem(outboxKey)) || [];}
    catch{return [];}
  }

  function saveLead(lead){
    const outbox = [lead,...getOutbox()].slice(0,50);
    localStorage.setItem(outboxKey, JSON.stringify(outbox));
    return outbox;
  }

  function slackPayload(lead){
    const fields = [
      {title:"Type", value:lead.type || "General", short:true},
      {title:"Name", value:lead.name || "Unlisted", short:true},
      {title:"Email", value:lead.email || "Unlisted", short:true},
      {title:"Interest", value:lead.interest || "Unlisted", short:true},
      {title:"Budget", value:lead.budget || "Unlisted", short:true},
      {title:"Timeline", value:lead.timeline || "Unlisted", short:true},
      {title:"Source", value:lead.source || document.title, short:true}
    ];
    return {
      text: `New Inkspirations Studios lead: ${lead.name || "Visitor"} - ${lead.type || "General"}`,
      blocks: [
        {type:"header", text:{type:"plain_text", text:"New Inkspirations Studios Lead"}},
        {type:"section", fields:fields.map(field => ({type:"mrkdwn", text:`*${field.title}:*\n${field.value}`}))},
        {type:"section", text:{type:"mrkdwn", text:`*Message:*\n${lead.message || "No message provided."}`}},
        {type:"context", elements:[{type:"mrkdwn", text:`Lead ID: ${lead.id} | ${lead.createdAt}`}]}
      ],
      lead
    };
  }

  function mailtoUrl(lead){
    const subject = encodeURIComponent(`Inkspirations Studios ${lead.type || "Inquiry"} - ${lead.name || "New Lead"}`);
    const body = encodeURIComponent([
      `Lead ID: ${lead.id || ""}`,
      `Type: ${lead.type || ""}`,
      `Name: ${lead.name || ""}`,
      `Email: ${lead.email || ""}`,
      `Phone / Handle: ${lead.contact || ""}`,
      `Interest: ${lead.interest || ""}`,
      `Budget: ${lead.budget || ""}`,
      `Timeline: ${lead.timeline || ""}`,
      `Source: ${lead.source || document.title}`,
      "",
      lead.message || ""
    ].join("\n"));
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  async function postLead(lead){
    if(!configuredRelay) return {ok:false, reason:"No relay endpoint configured."};
    const response = await fetch(configuredRelay, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(slackPayload(lead))
    });
    if(!response.ok) throw new Error(`Relay returned ${response.status}`);
    return {ok:true};
  }

  function downloadJson(payload, filename){
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function copyJson(payload){
    const text = JSON.stringify(payload,null,2);
    if(navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    return Promise.resolve();
  }

  window.InkspirationsLead = {
    relayKey,
    outboxKey,
    configuredRelay,
    clean,
    leadId,
    getOutbox,
    saveLead,
    slackPayload,
    mailtoUrl,
    postLead,
    downloadJson,
    copyJson
  };
})();
