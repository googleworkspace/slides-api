# Copyright 2017 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

../../node_modules/license-generator/index.js install mit -n "YOUR_NAME" && cat LICENSE >> mit.txt
../../node_modules/license-generator/index.js install apache -n "YOUR_NAME" && cat LICENSE >> apache-2.0.txt
../../node_modules/license-generator/index.js install gpl-v2 -n "YOUR_NAME" && cat LICENSE >> gpl-2.0.txt
../../node_modules/license-generator/index.js install gpl-v3 -n "YOUR_NAME" && cat LICENSE >> gpl-3.0.txt
../../node_modules/license-generator/index.js install bsd-3-clause -n "YOUR_NAME" && cat LICENSE >> bsd-3-clause.txt
../../node_modules/license-generator/index.js install bsd -n "YOUR_NAME" && cat LICENSE >> bsd-2-clause.txt
../../node_modules/license-generator/index.js install unlicense -n "YOUR_NAME" && cat LICENSE >> unlicense.txt
../../node_modules/license-generator/index.js install agpl -n "YOUR_NAME" && cat LICENSE >> agpl-3.0.txt
../../node_modules/license-generator/index.js install lgpl-v3 -n "YOUR_NAME" && cat LICENSE >> lgpl-3.0.txt
../../node_modules/license-generator/index.js install cc0 -n "YOUR_NAME" && cat LICENSE >> cc0-1.0.txt
