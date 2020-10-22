
import cv2
ncars=0;

car_cascade = cv2.CascadeClassifier('car.xml')
frames=cv2.imread('Khare_testFrame_02.jpg')
gray = cv2.cvtColor(frames, cv2.COLOR_BGR2GRAY)
print(car_cascade)
cars = car_cascade.detectMultiScale( gray, 1.1, 1)
for (x,y,w,h) in cars:
    cv2.rectangle(frames,(x,y),(x+w,y+h),(0,0,255),2)
    font = cv2.FONT_HERSHEY_DUPLEX
    st='car'+str(ncars);
    cv2.putText(frames, st, (x + 6, y - 6), font, 0.5, (0, 0, 255), 1)
    ncars=ncars+1;
cv2.imshow('Car Detection', frames)
print(ncars)


