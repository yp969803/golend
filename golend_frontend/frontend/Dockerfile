FROM node:16.13.2-alpine as build 
WORKDIR /app 


RUN npm cache clean -force
COPY package.json .


RUN npm install 
COPY . .

RUN npm run build


FROM nginx:1.21.5-alpine as release 
COPY --from=build /app/build /usr/share/nginx/html/ 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
