2025-Oct-24 17:37:43.970547
Starting deployment of SaideLeon/CaraON:master to localhost.
2025-Oct-24 17:37:44.522759
Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.11.
2025-Oct-24 17:37:48.198794
----------------------------------------
2025-Oct-24 17:37:48.202645
Importing SaideLeon/CaraON:master (commit sha HEAD) to /artifacts/cs0k8os408o044gsw0gw8o0k.
2025-Oct-24 17:37:50.445132
Image not found (lwogwk8ogs8wcwgo0kwkcgkw:19a644e5fd0eabf1bb76c36795f89bda10ad5d02). Building new image.
2025-Oct-24 17:37:53.302273
----------------------------------------
2025-Oct-24 17:37:53.306989
Building docker image started.
2025-Oct-24 17:37:53.310139
To check the current progress, click on Show Debug Logs.
2025-Oct-24 17:38:02.531786
Oops something is not okay, are you okay? 😢
2025-Oct-24 17:38:02.536663
#0 building with "default" instance using docker driver
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#1 [internal] load build definition from Dockerfile
2025-Oct-24 17:38:02.536663
#1 transferring dockerfile: 961B done
2025-Oct-24 17:38:02.536663
#1 DONE 0.0s
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#2 [internal] load metadata for docker.io/library/node:20-slim
2025-Oct-24 17:38:02.536663
#2 DONE 0.5s
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#3 [internal] load .dockerignore
2025-Oct-24 17:38:02.536663
#3 transferring context: 59B done
2025-Oct-24 17:38:02.536663
#3 DONE 0.0s
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#4 [1/6] FROM docker.io/library/node:20-slim@sha256:cba1d7bb8433bb920725193cd7d95d09688fb110b170406f7d4de948562f9850
2025-Oct-24 17:38:02.536663
#4 DONE 0.0s
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#5 [internal] load build context
2025-Oct-24 17:38:02.536663
#5 transferring context: 1.09MB 0.0s done
2025-Oct-24 17:38:02.536663
#5 DONE 0.0s
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#6 [2/6] WORKDIR /app
2025-Oct-24 17:38:02.536663
#6 CACHED
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#7 [3/6] COPY package*.json ./
2025-Oct-24 17:38:02.536663
#7 CACHED
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#8 [4/6] RUN npm install --only=production
2025-Oct-24 17:38:02.536663
#8 CACHED
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#9 [5/6] COPY . .
2025-Oct-24 17:38:02.536663
#9 DONE 0.1s
2025-Oct-24 17:38:02.536663
2025-Oct-24 17:38:02.536663
#10 [6/6] RUN npm run build
2025-Oct-24 17:38:02.536663
#10 0.198
2025-Oct-24 17:38:02.536663
#10 0.198 > nextn@0.1.0 build
2025-Oct-24 17:38:02.536663
#10 0.198 > next build
2025-Oct-24 17:38:02.536663
#10 0.198
2025-Oct-24 17:38:02.536663
#10 0.894 Attention: Next.js now collects completely anonymous telemetry regarding usage.
2025-Oct-24 17:38:02.536663
#10 0.894 This information is used to shape Next.js' roadmap and prioritize features.
2025-Oct-24 17:38:02.536663
#10 0.894 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
2025-Oct-24 17:38:02.536663
#10 0.894 https://nextjs.org/telemetry
2025-Oct-24 17:38:02.536663
#10 0.895
2025-Oct-24 17:38:02.536663
#10 1.031    ▲ Next.js 15.3.3
2025-Oct-24 17:38:02.536663
#10 1.031    - Environments: .env
2025-Oct-24 17:38:02.536663
#10 1.031
2025-Oct-24 17:38:02.536663
#10 1.052    Creating an optimized production build ...
2025-Oct-24 17:38:02.536663
#10 6.938 Failed to compile.
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 ./src/app/(app)/contacts/page.tsx
2025-Oct-24 17:38:02.536663
#10 6.938 Module not found: Can't resolve '@/components/ui/card'
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 https://nextjs.org/docs/messages/module-not-found
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 ./src/app/(app)/contacts/page.tsx
2025-Oct-24 17:38:02.536663
#10 6.938 Module not found: Can't resolve '@/components/ui/select'
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 https://nextjs.org/docs/messages/module-not-found
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 ./src/app/(app)/contacts/page.tsx
2025-Oct-24 17:38:02.536663
#10 6.938 Module not found: Can't resolve '@/hooks/use-toast'
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 https://nextjs.org/docs/messages/module-not-found
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 ./src/app/(app)/contacts/page.tsx
2025-Oct-24 17:38:02.536663
#10 6.938 Module not found: Can't resolve '@/services/api'
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 https://nextjs.org/docs/messages/module-not-found
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 ./src/app/(app)/contacts/page.tsx
2025-Oct-24 17:38:02.536663
#10 6.938 Module not found: Can't resolve '@/components/contacts/ContactSummaryCard'
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.938 https://nextjs.org/docs/messages/module-not-found
2025-Oct-24 17:38:02.536663
#10 6.938
2025-Oct-24 17:38:02.536663
#10 6.946
2025-Oct-24 17:38:02.536663
#10 6.947 > Build failed because of webpack errors
2025-Oct-24 17:38:02.536663
#10 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
2025-Oct-24 17:38:02.536663
------
2025-Oct-24 17:38:02.536663
> [6/6] RUN npm run build:
2025-Oct-24 17:38:02.536663
6.938
2025-Oct-24 17:38:02.536663
6.938 https://nextjs.org/docs/messages/module-not-found
2025-Oct-24 17:38:02.536663
6.938
2025-Oct-24 17:38:02.536663
6.938 ./src/app/(app)/contacts/page.tsx
2025-Oct-24 17:38:02.536663
6.938 Module not found: Can't resolve '@/components/contacts/ContactSummaryCard'
2025-Oct-24 17:38:02.536663
6.938
2025-Oct-24 17:38:02.536663
6.938 https://nextjs.org/docs/messages/module-not-found
2025-Oct-24 17:38:02.536663
6.938
2025-Oct-24 17:38:02.536663
6.946
2025-Oct-24 17:38:02.536663
6.947 > Build failed because of webpack errors
2025-Oct-24 17:38:02.536663
------
2025-Oct-24 17:38:02.536663
Dockerfile:20
2025-Oct-24 17:38:02.536663
--------------------
2025-Oct-24 17:38:02.536663
18 |
2025-Oct-24 17:38:02.536663
19 |     # Faz o build da aplicação Next.js para produção.
2025-Oct-24 17:38:02.536663
20 | >>> RUN npm run build
2025-Oct-24 17:38:02.536663
21 |
2025-Oct-24 17:38:02.536663
22 |     # Expõe a porta em que a aplicação Next.js será executada.
2025-Oct-24 17:38:02.536663
--------------------
2025-Oct-24 17:38:02.536663
ERROR: failed to build: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
2025-Oct-24 17:38:02.536663
exit status 1
2025-Oct-24 17:38:02.541627
Deployment failed. Removing the new version of your application.
2025-Oct-24 17:38:03.819222
Gracefully shutting down build container: cs0k8os408o044gsw0gw8o0k