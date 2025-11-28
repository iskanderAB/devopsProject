// Middleware de logging détaillé pour toutes les requêtes
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  // Ajouter un ID unique à la requête pour le traçage
  req.requestId = requestId;
  
  console.log("\x1b[36m%s\x1b[0m", "═".repeat(60));
  console.log(`\x1b[36m[REQUEST ${requestId}]\x1b[0m ${timestamp}`);
  console.log(`\x1b[36m[REQUEST ${requestId}]\x1b[0m ${req.method} ${req.url}`);
  console.log(`\x1b[36m[REQUEST ${requestId}]\x1b[0m IP: ${req.ip}`);
  console.log(`\x1b[36m[REQUEST ${requestId}]\x1b[0m User-Agent: ${req.get('user-agent')}`);
  
  // Logger les headers (masquer les headers sensibles)
  const sanitizedHeaders = { ...req.headers };
  if (sanitizedHeaders.authorization) {
    sanitizedHeaders.authorization = 'Bearer ***MASKED***';
  }
  console.log(`\x1b[36m[REQUEST ${requestId}]\x1b[0m Headers:`, JSON.stringify(sanitizedHeaders, null, 2));
  
  // Logger le body (masquer les mots de passe)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = JSON.parse(JSON.stringify(req.body));
    if (sanitizedBody.user?.password) {
      sanitizedBody.user.password = '***MASKED***';
    }
    console.log(`\x1b[36m[REQUEST ${requestId}]\x1b[0m Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  // Logger les query params
  if (Object.keys(req.query).length > 0) {
    console.log(`\x1b[36m[REQUEST ${requestId}]\x1b[0m Query:`, req.query);
  }
  
  // Logger les params
  if (Object.keys(req.params).length > 0) {
    console.log(`\x1b[36m[REQUEST ${requestId}]\x1b[0m Params:`, req.params);
  }
  
  // Intercepter la réponse pour logger le status code et le temps de réponse
  const startTime = Date.now();
  
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    console.log(`\x1b[32m[RESPONSE ${requestId}]\x1b[0m Status: ${res.statusCode}`);
    console.log(`\x1b[32m[RESPONSE ${requestId}]\x1b[0m Duration: ${duration}ms`);
    console.log(`\x1b[32m[RESPONSE ${requestId}]\x1b[0m Body:`, JSON.stringify(data, null, 2));
    console.log("\x1b[36m%s\x1b[0m", "═".repeat(60));
    return originalJson.call(this, data);
  };
  
  // Capturer les erreurs de réponse
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      const duration = Date.now() - startTime;
      console.log(`\x1b[31m[RESPONSE ${requestId}]\x1b[0m Error Status: ${res.statusCode}`);
      console.log(`\x1b[31m[RESPONSE ${requestId}]\x1b[0m Duration: ${duration}ms`);
      console.log("\x1b[36m%s\x1b[0m", "═".repeat(60));
    }
  });
  
  next();
};

module.exports = requestLogger;
