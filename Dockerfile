FROM node:22

WORKDIR /app


RUN apt-get update && \
  apt-get --no-install-recommends install -y libreoffice ghostscript graphicsmagick && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*


RUN mkdir -p /app/.yarn/cache


COPY package.json yarn.lock ./


RUN yarn --frozen-lockfile


COPY . .

RUN yarn build

CMD ["node", "--env-file=.env", "."]
