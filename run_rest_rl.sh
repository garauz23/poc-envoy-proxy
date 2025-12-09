# for j in $(seq 1 5); do
#   echo "== second $j =="
#   for i in $(seq 1 15); do
#     curl -s -o /dev/null -w "%{http_code} " http://localhost:10000/service2/hello
#   done
#   echo ""
#   sleep 1
# done
# for i in $(seq 1 20); do
#   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:10000/service2/hello
# done
for i in $(seq 1 10); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    http://localhost:10000/service2/hello &
done
wait
