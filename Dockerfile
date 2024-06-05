FROM nginx:alpine
COPY ./dist /usr/share/nginx/html
COPY ./nginx/conf.d /etc/nginx/conf.d
COPY ./nginx/ssl /etc/nginx/ssl
EXPOSE 443